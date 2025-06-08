terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

resource "aws_vpc" "ksp_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name           = "ksp_vpc"
    "project-name" = "ksp"
  }
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.ksp_vpc.id

  tags = {
    Name           = "internet_gateway"
    "project-name" = "ksp"
  }
}

resource "aws_subnet" "ksp_subnet" {
  vpc_id                  = aws_vpc.ksp_vpc.id
  cidr_block              = "10.0.0.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name           = "ksp_subnet"
    "project-name" = "ksp"
  }
}

resource "aws_subnet" "ksp_subnet_2" {
  vpc_id            = aws_vpc.ksp_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name           = "ksp_subnet_2"
    "project-name" = "ksp"
  }
}

resource "aws_route_table" "igw_rt" {
  vpc_id = aws_vpc.ksp_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = {
    Name           = "Internet gateway route table"
    "project-name" = "ksp"
  }
}

resource "aws_route_table_association" "public_subnet_association" {
  subnet_id      = aws_subnet.ksp_subnet.id
  route_table_id = aws_route_table.igw_rt.id
}

resource "aws_security_group" "public_sg" {
  name        = "ksp_public_security_group"
  description = "Security group for the public subnet"
  vpc_id      = aws_vpc.ksp_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  egress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  egress {
    from_port   = 1
    to_port     = 65535
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all UDP outbound (needed by Tailscale)"
  }

  egress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "PostgreSQL access"
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  tags = {
    Name           = "public_sg"
    "project-name" = "ksp"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "rds_security_group"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.ksp_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "PostgreSQL access from VPC"
  }

  tags = {
    Name           = "rds_sg"
    "project-name" = "ksp"
  }
}

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "rds-subnet-group"
  subnet_ids = [aws_subnet.ksp_subnet.id, aws_subnet.ksp_subnet_2.id]

  tags = {
    Name           = "rds-subnet-group"
    "project-name" = "ksp"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.ksp_subnet.id
  vpc_security_group_ids = [aws_security_group.public_sg.id]

  root_block_device {
    volume_type = "gp3"
    volume_size = 30 
    encrypted   = false
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    
    exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
    echo "Iniciando configuración del servidor..."

    sudo dnf update -y
    sudo dnf install -y curl wget git

    curl -fsSL https://tailscale.com/install.sh | sh
    
    sudo systemctl enable tailscaled
    sudo systemctl start tailscaled
    
    echo "Configurando Tailscale con auth key..."
    sudo tailscale up --authkey="${var.tailscale_auth_key}" --accept-routes --accept-dns

    echo "ec2-user:${var.ssh_password}" | sudo chpasswd
    sudo sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/g' /etc/ssh/sshd_config
    sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/g' /etc/ssh/sshd_config
    sudo sed -i 's/ChallengeResponseAuthentication no/ChallengeResponseAuthentication yes/g' /etc/ssh/sshd_config
    sudo systemctl restart sshd

    # Install Docker
    sudo dnf install -y docker
    
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker ec2-user
    newgrp docker
    
    sleep 5
    sudo tailscale status

    docker run -d -p 80:80 \
      -e MODE=${var.mode} \
      -e PORT=${var.port} \
      -e HOST=${var.host} \
      -e RUST_LOG=${var.rust_log} \
      -e SECRET_KEY=${var.secret_key} \
      -e DATABASE_URL=postgres://${var.db_username}:${var.db_password}@${aws_db_instance.postgresql.endpoint}:${aws_db_instance.postgresql.port}/${var.db_name} \
      -e POSTGRES_USER=${var.db_username} \
      -e POSTGRES_PASSWORD=${var.db_password} \
      -e POSTGRES_DB=${var.db_name} \
      -e GROQ_API_KEY=${var.groq_api_key} \
      -e BROWSERLESS_WS=${var.browserless_ws} \
      -e INSTAGRAM_USERNAME=${var.instagram_username} \
      -e INSTAGRAM_PASSWORD=${var.instagram_password} \
      --name ksp-app zamcv/ksp:v3
    
    EOF
  )

  tags = {
    Name           = "ksp-app"
    "project-name" = "ksp"
  }
}

resource "aws_db_instance" "postgresql" {
  identifier             = var.db_identifier
  engine                 = "postgres"
  engine_version         = "17"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = var.db_max_allocated_storage
  storage_type           = "gp3"
  storage_encrypted      = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name

  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = var.skip_final_snapshot
  deletion_protection = var.deletion_protection

  enabled_cloudwatch_logs_exports = ["postgresql"]

  performance_insights_enabled = false
  monitoring_interval         = 0

  publicly_accessible = false

  tags = {
    Name           = "postgresql-rds"
    "project-name" = "rds"
  }
}

output "app_public_ip" {
  value = aws_instance.app.public_ip
}

output "db_endpoint" {
  value = aws_db_instance.postgresql.endpoint
}

output "db_port" {
  value = aws_db_instance.postgresql.port
}

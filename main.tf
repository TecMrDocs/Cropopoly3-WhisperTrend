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

# ========================================
# VPC Y NETWORKING
# ========================================

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
    Name           = "ksp_subnet_public"
    "project-name" = "ksp"
  }
}

resource "aws_subnet" "ksp_subnet_2" {
  vpc_id            = aws_vpc.ksp_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]
  # NO necesita ser pública para RDS
  map_public_ip_on_launch = false

  tags = {
    Name           = "ksp_subnet_2_private"
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

# ========================================
# SECURITY GROUPS
# ========================================

resource "aws_security_group" "elb_sg" {
  name        = "ksp_elb_security_group"
  description = "Security group for the Classic Load Balancer"
  vpc_id      = aws_vpc.ksp_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
    description = "Allow traffic to VPC"
  }

  tags = {
    Name           = "elb_sg"
    "project-name" = "ksp"
  }
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
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.elb_sg.id]
    description     = "HTTP access from ELB"
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

# ========================================
# CLASSIC LOAD BALANCER (ELB)
# ========================================

resource "aws_elb" "ksp_elb" {
  name            = "ksp-elb"
  subnets         = [aws_subnet.ksp_subnet.id]
  security_groups = [aws_security_group.elb_sg.id]

  listener {
    instance_port     = 80
    instance_protocol = "http"
    lb_port           = 80
    lb_protocol       = "http"
  }

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    target              = "HTTP:80/"
  }

  cross_zone_load_balancing   = true
  idle_timeout                = 400
  connection_draining         = true
  connection_draining_timeout = 400

  tags = {
    Name           = "ksp-elb"
    "project-name" = "ksp"
  }
}

# ========================================
# AUTO SCALING GROUP
# ========================================

resource "aws_launch_template" "ksp_template" {
  name_prefix   = "ksp-template"
  image_id      = data.aws_ami.amazon_linux_2023.id
  instance_type = "t3.medium"

  vpc_security_group_ids = [aws_security_group.public_sg.id]

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_type = "gp3"
      volume_size = 30
      encrypted   = false
    }
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    
    exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
    echo "Iniciando configuración del servidor..."

    sudo dnf update -y
    sudo dnf install -y curl wget git nc

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
      -e DATABASE_URL=postgres://${var.db_username}:${var.db_password}@${aws_db_instance.postgresql.address}:${aws_db_instance.postgresql.port}/${var.db_name} \
      -e POSTGRES_USER=${var.db_username} \
      -e POSTGRES_PASSWORD=${var.db_password} \
      -e POSTGRES_DB=${var.db_name} \
      -e GROQ_API_KEY=${var.groq_api_key} \
      -e BROWSERLESS_WS=${var.browserless_ws} \
      -e INSTAGRAM_USERNAME=${var.instagram_username} \
      -e INSTAGRAM_PASSWORD=${var.instagram_password} \
      -e TWITTER_USERNAME=${var.twitter_username} \
      -e TWITTER_PASSWORD=${var.twitter_password} \
      -e AWS_ACCESS_KEY_ID=${var.aws_access_key_id} \
      -e AWS_SECRET_ACCESS_KEY=${var.aws_secret_access_key} \
      -e AWS_REGION=${var.aws_region} \
      -e DYNAMODB_TABLE_PREFIX=${var.dynamodb_table_prefix} \
      -e JWT_SECRET=${var.jwt_secret} \
      --name ksp-app zamcv/ksp:v3
    
    EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name           = "ksp-app-asg"
      "project-name" = "ksp"
    }
  }
}

resource "aws_autoscaling_group" "ksp_asg" {
  name                = "ksp-autoscaling-group"
  vpc_zone_identifier = [aws_subnet.ksp_subnet.id]
  
  min_size         = 1
  max_size         = 4
  desired_capacity = 2

  # Asociar con el ELB
  load_balancers = [aws_elb.ksp_elb.name]

  # Health check
  health_check_type         = "ELB"  # Usa el health check del ELB
  health_check_grace_period = 300    # Tiempo antes de hacer health check

  launch_template {
    id      = aws_launch_template.ksp_template.id
    version = "$Latest"
  }

  termination_policies = ["OldestInstance"]

  tag {
    key                 = "Name"
    value               = "ksp-app-autoscaling"
    propagate_at_launch = true
  }

  tag {
    key                 = "project-name"
    value               = "ksp"
    propagate_at_launch = true
  }
}

# ========================================
# POLÍTICAS DE AUTO SCALING
# ========================================

resource "aws_autoscaling_policy" "scale_up" {
  name                   = "ksp-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown              = 300
  autoscaling_group_name = aws_autoscaling_group.ksp_asg.name
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "ksp-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown              = 300
  autoscaling_group_name = aws_autoscaling_group.ksp_asg.name
}

# ========================================
# CLOUDWATCH ALARMS
# ========================================

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "ksp-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "70"    # Si CPU > 70%
  alarm_description   = "This metric monitors ec2 cpu utilization"
  alarm_actions       = [aws_autoscaling_policy.scale_up.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.ksp_asg.name
  }
}

resource "aws_cloudwatch_metric_alarm" "low_cpu" {
  alarm_name          = "ksp-low-cpu"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = "30"    # Si CPU < 30%
  alarm_description   = "This metric monitors ec2 cpu utilization"
  alarm_actions       = [aws_autoscaling_policy.scale_down.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.ksp_asg.name
  }
}

# ========================================
# RDS DATABASE
# ========================================

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "rds-subnet-group"
  subnet_ids = [aws_subnet.ksp_subnet.id, aws_subnet.ksp_subnet_2.id]

  tags = {
    Name           = "rds-subnet-group"
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
    "project-name" = "ksp"
  }
}

# ========================================
# DATA SOURCES
# ========================================

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

# ========================================
# OUTPUTS
# ========================================

output "elb_dns_name" {
  value       = aws_elb.ksp_elb.dns_name
  description = "DNS name of the Classic Load Balancer"
}

output "elb_zone_id" {
  value       = aws_elb.ksp_elb.zone_id
  description = "Zone ID of the Classic Load Balancer"
}

output "autoscaling_group_name" {
  value       = aws_autoscaling_group.ksp_asg.name
  description = "Name of the Auto Scaling Group"
}

output "db_endpoint" {
  value       = aws_db_instance.postgresql.endpoint
  description = "RDS PostgreSQL endpoint"
}

output "db_port" {
  value       = aws_db_instance.postgresql.port
  description = "RDS PostgreSQL port"
}

output "db_address" {
  value       = aws_db_instance.postgresql.address
  description = "RDS PostgreSQL address (without port)"
}

output "vpc_id" {
  value       = aws_vpc.ksp_vpc.id
  description = "VPC ID"
}

output "public_subnet_id" {
  value       = aws_subnet.ksp_subnet.id
  description = "Public subnet ID"
}
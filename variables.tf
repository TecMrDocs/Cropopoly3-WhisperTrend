variable "region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "tailscale_auth_key" {
  description = "Tailscale authentication key"
  type        = string
  sensitive   = true
}

variable "ssh_password" {
  description = "Password for SSH authentication"
  type        = string
  sensitive   = true
}

variable "db_identifier" {
  description = "Database identifier"
  type        = string
  default     = "postgres-rds"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS (GB)"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS (GB)"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "myapp"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
  validation {
    condition     = length(var.db_password) >= 8
    error_message = "Database password must be at least 8 characters long."
  }
}

variable "backup_retention_period" {
  description = "Backup retention period (days)"
  type        = number
  default     = 7
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when deleting RDS"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = false
}

variable "mode" {
  description = "Mode of the application"
  type        = string
  default     = "prod"
}

variable "port" {
  description = "Port of the application"
  type        = number
  default     = 80
}

variable "host" {
  description = "Host of the application"
  type        = string
  default     = "0.0.0.0"
}

variable "rust_log" {
  description = "Rust log of the application"
  type        = string
  default     = "info"
}

variable "secret_key" {
  description = "Secret key of the application"
  type        = string
  default     = "secret"
}

variable "groq_api_key" {
  description = "Groq API key"
  type        = string
}

variable "browserless_ws" {
  description = "Browserless WebSocket"
  type        = string
}

variable "instagram_username" {
  description = "Instagram username"
  type        = string
}

variable "instagram_password" {
  description = "Instagram password"
  type        = string
  sensitive   = true
}

variable "twitter_username" {
  description = "Twitter username"
  type        = string
}

variable "twitter_password" {
  description = "Twitter password"
  type        = string
}

variable "aws_access_key_id" {
  description = "AWS access key ID"
  type        = string
}

variable "aws_secret_access_key" {
  description = "AWS secret access key"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "dynamodb_table_prefix" {
  description = "DynamoDB table prefix"
  type        = string
}

variable "jwt_secret" {
  description = "JWT secret"
  type        = string
  sensitive   = true
}

variable "resend_api_key" {
  description = "Resend API key"
  type        = string
}

variable "email_from" {
  description = "Email from"
  type        = string
}
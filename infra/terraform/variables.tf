# -----------------------------
# Variables generales
# -----------------------------
variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto"
  default     = "proyecto-grupo6"
}

# -----------------------------
# VPC y subnets
# -----------------------------
variable "vpc_cidr" {
  description = "CIDR de la VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Lista de CIDR para subnets públicas"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Lista de CIDR para subnets privadas"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

# -----------------------------
# RDS
# -----------------------------
variable "rds_username" {
  description = "Usuario master de RDS"
  default     = "grupo6admin"
}

variable "rds_password" {
  description = "Password master de RDS"
  type        = string
  sensitive   = true
}

variable "rds_db_name" {
  description = "Nombre de la base de datos"
  default     = "backend_db"
}

variable "rds_instance_class" {
  description = "Clase de instancia de RDS"
  default     = "db.t3.micro"
}

# -----------------------------
# EC2
# -----------------------------
variable "ec2_instance_type" {
  description = "Tipo de instancia EC2"
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "Nombre del key pair en AWS para EC2"
  default     = "grupo6-key"
}

variable "ec2_ami" {
  description = "AMI de Ubuntu para EC2"
  default     = ""
}

# -----------------------------
# S3
# -----------------------------
variable "s3_bucket_name" {
  description = "Nombre del bucket S3"
  default     = "grupo6-files"
}

# -----------------------------
# SQS
# -----------------------------
variable "sqs_queue_name" {
  description = "Nombre de la cola SQS"
  default     = "grupo6-queue"
}

# -----------------------------
# Lambda
# -----------------------------
variable "subnet_ids_private" {
  description = "Lista de subnets privadas para Lambda que accede a RDS"
  type        = list(string)
}

variable "security_group_ids_lambda_rds" {
  description = "Security group(s) para Lambda que accede a RDS"
  type        = list(string)
}

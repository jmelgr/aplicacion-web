# -----------------------------
# Proyecto
# -----------------------------
project_name = "proyecto-grupo6"
aws_region       = "us-east-1"

# -----------------------------
# RDS
# -----------------------------
rds_username = "grupo6admin"
rds_password = "grupo6404!!"
rds_db_name  = "backend_db"
rds_instance_class = "db.t3.micro"

# -----------------------------
# EC2
# -----------------------------
ec2_instance_type = "t3.micro"
ec2_key_name      = "grupo6-key"
ec2_ami          = ""

# -----------------------------
# VPC y subnets
# -----------------------------
vpc_cidr        = "10.0.0.0/16"
public_subnet_cidrs = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.3.0/24", "10.0.4.0/24"]

# -----------------------------
# S3
# -----------------------------
s3_bucket_name = "grupo6-files"

# -----------------------------
# SQS
# -----------------------------
sqs_queue_name = "grupo6-queue"

# -----------------------------
# Lambdas
# -----------------------------
subnet_ids_private           = ["10.0.3.0/24", "10.0.4.0/24"]
security_group_ids_lambda_rds = ["sg-0168348e4b3de7471"]

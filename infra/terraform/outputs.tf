# -----------------------------
# Outputs de VPC y Subnets
# -----------------------------
output "vpc_id" {
  description = "ID de la VPC principal"
  value       = aws_vpc.main.id
}

output "public_subnets" {
  description = "Lista de subnets públicas"
  value       = values(aws_subnet.public)[*].id
}

output "private_subnets" {
  description = "Lista de subnets privadas"
  value       = values(aws_subnet.private)[*].id
}

# -----------------------------
# Outputs de EC2
# -----------------------------

output "alb_dns_name" {
  description = "DNS del Application Load Balancer"
  value       = aws_lb.backend_alb.dns_name
}

# -----------------------------
# Outputs de RDS
# -----------------------------
output "rds_endpoint" {
  description = "Endpoint de la base de datos RDS"
  value       = aws_db_instance.main.endpoint
}

# -----------------------------
# Outputs de S3
# -----------------------------
output "s3_bucket_name" {
  description = "Nombre del bucket S3"
  value       = aws_s3_bucket.files_bucket.id
}

# -----------------------------
# Outputs de SQS
# -----------------------------
output "sqs_queue_url" {
  description = "URL de la cola SQS"
  value       = aws_sqs_queue.file_queue.id
}

# Obtener IPs públicas de todas las instancias del ASG
data "aws_instances" "backend_instances" {
  filter {
    name   = "tag:Name"
    values = ["${var.project_name}-backend"]
  }
}

data "aws_instance" "backend_ips" {
  for_each = toset(data.aws_instances.backend_instances.ids)
  instance_id = each.value
}

output "ec2_public_ips" {
  description = "Lista de IPs públicas de las instancias EC2 del backend"
  value       = [for i in data.aws_instance.backend_ips : i.public_ip]
}


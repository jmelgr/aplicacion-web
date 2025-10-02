# -----------------------------
# RDS Subnet Group
# -----------------------------
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-subnet-group"
  subnet_ids = values(aws_subnet.private)[*].id
  tags       = { Name = "${var.project_name}-db-subnet-group" }
}

# -----------------------------
# RDS Instance
# -----------------------------
resource "aws_db_instance" "main" {
  engine            = "postgres"
  engine_version    = "17.6"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  db_name           = var.rds_db_name
  username          = var.rds_username
  password          = var.rds_password
  parameter_group_name = "default.postgres17"
  skip_final_snapshot = true
  multi_az          = false
  storage_encrypted = true
  publicly_accessible = true
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name  = aws_db_subnet_group.main.name
  tags = {
    Name = "${var.project_name}-rds"
  }
}

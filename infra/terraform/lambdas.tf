# Esta parte aún la estamos depurando

# -----------------------------
# Lambdas: actualización RDS y eliminación S3
# -----------------------------

# IAM Role para Lambda RDS
resource "aws_iam_role" "lambda_rds_role" {
  name = "${var.project_name}-lambda-rds-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_rds_policy" {
  name = "${var.project_name}-lambda-rds-policy"
  role = aws_iam_role.lambda_rds_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "rds:DescribeDBInstances",
          "rds-data:ExecuteStatement",
          "rds-data:BatchExecuteStatement"
        ]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.file_queue.arn
      },
      {
        Effect   = "Allow"
        Action   = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_rds_vpc_access" {
  name = "${var.project_name}-lambda-rds-vpc-access"
  role = aws_iam_role.lambda_rds_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda que actualiza RDS
resource "aws_lambda_function" "update_rds" {
  function_name = "${var.project_name}-update-rds"
  filename      = "${path.module}/lambdas/lambda-rds.zip"
  handler       = "lambda-rds.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_rds_role.arn
  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      DB_HOST = aws_db_instance.main.endpoint
      DB_USER = var.rds_username
      DB_PASS = var.rds_password
      DB_NAME = var.rds_db_name
    }
  }

  vpc_config {
    subnet_ids         = values(aws_subnet.private)[*].id
    security_group_ids = [aws_security_group.rds_sg.id]
  }
}

resource "aws_lambda_event_source_mapping" "sqs_to_update_rds" {
  event_source_arn = aws_sqs_queue.file_queue.arn
  function_name    = aws_lambda_function.update_rds.arn
  batch_size       = 1
}

# IAM Role para Lambda S3
resource "aws_iam_role" "lambda_s3_role" {
  name = "${var.project_name}-lambda-s3-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_s3_access" {
  name = "${var.project_name}-lambda-s3-access"
  role = aws_iam_role.lambda_s3_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:DeleteObject", "s3:GetObject"]
        Resource = "arn:aws:s3:::${var.s3_bucket_name}/*"
      },
      {
        Effect   = "Allow"
        Action   = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = aws_sqs_queue.file_queue.arn
      },
      {
        Effect   = "Allow"
        Action   = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda que elimina archivos de S3
resource "aws_lambda_function" "delete_s3" {
  function_name = "${var.project_name}-delete-s3"
  filename      = "${path.module}/lambdas/lambda-s3.zip"
  handler       = "lambda-s3.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_s3_role.arn
  memory_size   = 128
  timeout       = 10

  environment {
    variables = {
      S3_BUCKET = var.s3_bucket_name
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_to_delete_s3" {
  event_source_arn = aws_sqs_queue.file_queue.arn
  function_name    = aws_lambda_function.delete_s3.arn
  batch_size       = 1
}

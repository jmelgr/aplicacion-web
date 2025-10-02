resource "aws_s3_bucket" "files_bucket" {
  bucket = "${var.project_name}-files-bucket"
  
  tags = {
    Name = "${var.project_name}-files-bucket"
  }
}

resource "aws_s3_bucket_public_access_block" "files_public_access" {
  bucket = aws_s3_bucket.files_bucket.id

  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_versioning" "files_versioning" {
  bucket = aws_s3_bucket.files_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "files_policy" {
  bucket = aws_s3_bucket.files_bucket.id

  policy = <<EOT
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "${aws_s3_bucket.files_bucket.arn}/*"
    }
  ]
}
EOT

  depends_on = [
    aws_s3_bucket_public_access_block.files_public_access
  ]
}



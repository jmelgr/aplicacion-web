resource "aws_sqs_queue" "file_queue" {
  name                        = "${var.project_name}-file-queue"
  visibility_timeout_seconds  = 30
  message_retention_seconds   = 86400
}

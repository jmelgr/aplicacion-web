# -----------------------------
# Launch Template para EC2
# -----------------------------
resource "aws_launch_template" "backend" {
  name_prefix   = "${var.project_name}-backend-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  
  key_name = "grupo6-key"

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.ec2_sg.id]
  }
  
  user_data = base64encode(trimspace(<<-EOF
#!/bin/bash
apt-get update
apt-get install -y nodejs npm git
EOF
  ))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-backend"
    }
  }
}

# -----------------------------
# Auto Scaling Group
# -----------------------------
resource "aws_autoscaling_group" "backend_asg" {
  desired_capacity     = 2
  max_size             = 2
  min_size             = 2
  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }
  vpc_zone_identifier = values(aws_subnet.public)[*].id
  target_group_arns   = [aws_lb_target_group.backend_tg.arn]

  tag {
    key                 = "Name"
    value               = "${var.project_name}-backend"
    propagate_at_launch = true
  }
}

# -----------------------------
# Application Load Balancer
# -----------------------------
resource "aws_lb" "backend_alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = values(aws_subnet.public)[*].id

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# -----------------------------
# Target Group
# -----------------------------
resource "aws_lb_target_group" "backend_tg" {
  name     = "${var.project_name}-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200-399"
  }
}

# -----------------------------
# Listener
# -----------------------------
resource "aws_lb_listener" "frontend" {
  load_balancer_arn = aws_lb.backend_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}

# -----------------------------
# AMI Data Source
# -----------------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# ALB Security Group
resource "aws_security_group" "alb_sg" {
  name        = "ai-evaluator-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.ai_evaluator_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "ai-evaluator-alb-sg"
    Environment = var.environment
  }
}

# EKS Security Group
resource "aws_security_group" "eks_sg" {
  name        = "ai-evaluator-eks-sg"
  description = "Security group for EKS cluster"
  vpc_id      = aws_vpc.ai_evaluator_vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "ai-evaluator-eks-sg"
    Environment = var.environment
  }
}

# RDS Security Group
resource "aws_security_group" "rds_sg" {
  name        = "ai-evaluator-rds-sg"
  description = "Security group for RDS database"
  vpc_id      = aws_vpc.ai_evaluator_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "ai-evaluator-rds-sg"
    Environment = var.environment
  }
}

# Redis Security Group
resource "aws_security_group" "redis_sg" {
  name        = "ai-evaluator-redis-sg"
  description = "Security group for Redis cluster"
  vpc_id      = aws_vpc.ai_evaluator_vpc.id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "ai-evaluator-redis-sg"
    Environment = var.environment
  }
}

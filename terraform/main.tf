terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
resource "aws_vpc" "ai_evaluator_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "ai-evaluator-vpc"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "ai_evaluator_igw" {
  vpc_id = aws_vpc.ai_evaluator_vpc.id

  tags = {
    Name        = "ai-evaluator-igw"
    Environment = var.environment
  }
}

# Public Subnets
resource "aws_subnet" "public_subnets" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.ai_evaluator_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = var.availability_zones[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name        = "ai-evaluator-public-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "public"
  }
}

# Private Subnets
resource "aws_subnet" "private_subnets" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.ai_evaluator_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "ai-evaluator-private-subnet-${count.index + 1}"
    Environment = var.environment
    Type        = "private"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.ai_evaluator_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.ai_evaluator_igw.id
  }

  tags = {
    Name        = "ai-evaluator-public-rt"
    Environment = var.environment
  }
}

# Route Table Association for Public Subnets
resource "aws_route_table_association" "public_rta" {
  count          = length(aws_subnet.public_subnets)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

# EKS Cluster
resource "aws_eks_cluster" "ai_evaluator_cluster" {
  name     = "ai-evaluator-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.28"

  vpc_config {
    subnet_ids              = concat(aws_subnet.public_subnets[*].id, aws_subnet.private_subnets[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
  ]

  tags = {
    Name        = "ai-evaluator-cluster"
    Environment = var.environment
  }
}

# EKS Node Group
resource "aws_eks_node_group" "ai_evaluator_nodes" {
  cluster_name    = aws_eks_cluster.ai_evaluator_cluster.name
  node_group_name = "ai-evaluator-nodes"
  node_role_arn   = aws_iam_role.eks_node_role.arn
  subnet_ids      = aws_subnet.private_subnets[*].id

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 1
  }

  update_config {
    max_unavailable = 1
  }

  instance_types = ["t3.medium"]
  capacity_type  = "ON_DEMAND"

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_container_registry_policy,
  ]

  tags = {
    Name        = "ai-evaluator-nodes"
    Environment = var.environment
  }
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "ai_evaluator_files" {
  bucket = "ai-evaluator-files-${random_string.bucket_suffix.result}"

  tags = {
    Name        = "ai-evaluator-files"
    Environment = var.environment
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_versioning" "ai_evaluator_files_versioning" {
  bucket = aws_s3_bucket.ai_evaluator_files.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ai_evaluator_files_encryption" {
  bucket = aws_s3_bucket.ai_evaluator_files.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# RDS PostgreSQL Database
resource "aws_db_subnet_group" "ai_evaluator_db_subnet_group" {
  name       = "ai-evaluator-db-subnet-group"
  subnet_ids = aws_subnet.private_subnets[*].id

  tags = {
    Name        = "ai-evaluator-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "ai_evaluator_db" {
  identifier             = "ai-evaluator-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp2"
  storage_encrypted      = true

  db_name  = "ai_evaluator"
  username = "postgres"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.ai_evaluator_db_subnet_group.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name        = "ai-evaluator-db"
    Environment = var.environment
  }
}

# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "ai_evaluator_cache_subnet_group" {
  name       = "ai-evaluator-cache-subnet-group"
  subnet_ids = aws_subnet.private_subnets[*].id
}

resource "aws_elasticache_cluster" "ai_evaluator_redis" {
  cluster_id           = "ai-evaluator-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.ai_evaluator_cache_subnet_group.name
  security_group_ids   = [aws_security_group.redis_sg.id]

  tags = {
    Name        = "ai-evaluator-redis"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "ai_evaluator_alb" {
  name               = "ai-evaluator-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public_subnets[*].id

  enable_deletion_protection = false

  tags = {
    Name        = "ai-evaluator-alb"
    Environment = var.environment
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "ai_evaluator_logs" {
  name              = "/aws/eks/ai-evaluator-cluster/cluster"
  retention_in_days = 7

  tags = {
    Name        = "ai-evaluator-logs"
    Environment = var.environment
  }
}

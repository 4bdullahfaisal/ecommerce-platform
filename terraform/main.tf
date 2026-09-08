terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"
  name   = var.cluster_name
  cidr   = var.vpc_cidr
}

module "eks" {
  source       = "./modules/eks"
  cluster_name = var.cluster_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnet_ids
}

module "monitoring" {
  source       = "./modules/monitoring"
  cluster_name = var.cluster_name
}

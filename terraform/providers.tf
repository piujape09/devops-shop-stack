terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
  }

  # Recommended: remote backend for shared state.
  # Uncomment and configure once you've created the bucket + lock table.
  #
  # backend "s3" {
  #   bucket         = "shopk8s-tfstate-<acct-id>"
  #   key            = "dev/eks.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "shopk8s-tflock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.region
}

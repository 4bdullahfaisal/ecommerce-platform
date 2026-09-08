variable "cluster_name" {
  type = string
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecommerce/${var.cluster_name}"
  retention_in_days = 30
}

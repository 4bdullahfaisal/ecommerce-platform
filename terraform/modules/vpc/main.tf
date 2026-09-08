variable "name" { type = string }
variable "cidr" { type = string }
resource "aws_vpc" "this" { cidr_block = var.cidr, tags = { Name = var.name } }
resource "aws_subnet" "private" { count = 2, vpc_id = aws_vpc.this.id, cidr_block = cidrsubnet(var.cidr, 4, count.index), availability_zone = data.aws_availability_zones.available.names[count.index], tags = { Name = "${var.name}-private-${count.index}" } }
data "aws_availability_zones" "available" { state = "available" }
output "vpc_id" { value = aws_vpc.this.id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }

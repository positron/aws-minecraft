variable "access_key" {}

variable "secret_key" {}

variable "region" {
  default = "us-east-1"
}

provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

resource "aws_iam_role" "terraform_test_role" {
  name = "terraform_test_role"

  # TODO document what this does
  assume_role_policy = <<EOF
      {
         "Version": "2012-10-17",
         "Statement": [
            {
               "Sid": "",
               "Effect": "Allow",
               "Principal": {
               "Service": "lambda.amazonaws.com"
               },
               "Action": "sts:AssumeRole"
            }
         ]
      }
   EOF
}

resource "aws_lambda_function" "terraform_test_lambda" {
  filename      = "hello_world.zip"
  function_name = "terraform_lambda_hello_world"
  role          = "${aws_iam_role.terraform_test_role.arn}"
  handler       = "hello_world.handler"
  runtime       = "nodejs4.3"
  timeout       = 1
}

resource "aws_lambda_permission" "allow_api_gateway" {
  function_name = "${aws_lambda_function.terraform_test_lambda.function_name}"
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.region}:${var.account_id}:${aws_api_gateway_rest_api.terraform_test_api.id}/*/${aws_api_gateway_integration.test_test-get-integration.integration_http_method}${aws_api_gateway_resource.test_test.path}"
}

resource "aws_api_gateway_rest_api" "terraform_test_api" {
  name        = "TerraformTestAPI"
  description = "This is the Terraform Test API"
}

resource "aws_api_gateway_resource" "test" {
  rest_api_id = "${aws_api_gateway_rest_api.terraform_test_api.id}"
  parent_id   = "${aws_api_gateway_rest_api.terraform_test_api.root_resource_id}"
  path_part   = "test"
}

resource "aws_api_gateway_method" "test-get" {
  rest_api_id   = "${aws_api_gateway_rest_api.terraform_test_api.id}"
  resource_id   = "${aws_api_gateway_resource.test.id}"
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "test-get-integration" {
  rest_api_id             = "${aws_api_gateway_rest_api.terraform_test_api.id}"
  resource_id             = "${aws_api_gateway_resource.test.id}"
  http_method             = "${aws_api_gateway_method.test-get.http_method}"
  type                    = "AWS"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${var.region}:${var.account_id}:function:${aws_lambda_function.terraform_test_lambda.function_name}/invocations"
  integration_http_method = "${aws_api_gateway_method.test-get.http_method}"
}

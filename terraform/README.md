# Infrastructure as Code
Best practice these days is to "define your infrastructure as code."
This means that you describe your servers and their configurations in text files and use 100% automated processes to create everything.
This prevents operator error, "configuration drift" where your systems move away from how they are documented/originally set up over time, and other bad things.
[Terraform][tf] is one system that lets you declaratively describe your cloud infrastructure in `.tf` files and run `terraform apply` to create it.


As this is still a work in progress, some things are still created manually.
I'll try to describe everything not managed by terraform in this README.

[tf]: https://www.terraform.io/

## How to use terraform
Describe what variables at the top to set.

Describe how terraform plan works and tfstate (usually bad practice to commit files that are machine generated, but it is necessary to persist these somehow. Some people use S3 so the state can be updated by multiple team members without them having to git push/pull. Storing in git is fine for a single developer.)

## Terraform manages
 * The lambda function
 * The S3 buckets/configurations
 * The security group for the EC2 instance

After everything is created, the lambda instance will be the one creating the EC2 instance every time you want to play.
Terraform does not manage that.

## You must manually create
The DNS hostname in route53

## Optional things to set up
I have CloudWatch [billing alerts][alert] set at $3, $5, and $10.
I've never gone above $3, but I have the higher amounts alerted too in case I go above $3 and there are more runaway charges after I resolve whatever put me above $3.

[alert]: http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html

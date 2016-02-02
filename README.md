# AWS Minecraft Utilities
This repo currently contains utilities to run a minecraft server on EC2. For a
server that only turns on a few hours a week, this is very cost-effective.

Maybe one day I will make this entirely automatic and configurable. Until then,
I hope some of these pieces are useful to you.

## Autoupdate DNS
Unless you pay extra for a ~~static~~ Elastic IP Address your EC2 server will
be assigned a new public IP each time you start it.

1. Copy the `update_dns.sh` script to your server.
2. Run `crontab -e` to edit your cron
3. Put `@reboot /path/to/update_dns.sh > ~/log 2>&1`

The script assumes you have run `aws configure` to set up access keys. I
recommend creating an IAM role that only has permissions to update DNS.

## Auto startup
Copy `minecraft.init.d` to `/etc/init.d/minecraft`.

## Website to let your friends turn on the server

### Create a IAM User for the website
Set up an IAM user with the policy below. That policy will allow that user to
start instances with the `use=minecraft` tag if they are a `t2` instance. It
will also allow the user to [modify][ec2-modify] attributes of any instance. Unfortunately
there is no way to lock this down any further, which is the reason the
`StartInstances` permission is locked down so tightly.

```javascript
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "ec2:StartInstances",
            "Resource": [ "arn:aws:ec2:*:700044736775:instance/*" ],
            "Condition": {
                "StringEquals": {
                    "ec2:InstanceType": [ "t2.nano", "t2.micro", "t2.small", "t2.medium", "t2.large" ],
                    "ec2:ResourceTag/use": "minecraft"
                }
            }
        },
        {
            "Effect": "Allow",
            "Action": "ec2:ModifyInstanceAttribute",
            "Resource": [ "*" ]
        }
    ]
}
```

[ec2-modify]: http://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_ModifyInstanceAttribute.html

### Create a lambda function so the website can get the credentials
Use the [instructions here][lambda] to set up a lambda function that returns the credentials for the user created above.

[lambda]: lambda/README.md

### Node wrapper around minecraft server
Run this command to allow node to bind to ports < 1024:

    sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``

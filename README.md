# AWS Minecraft Utilities
This repo currently contains utilities to run a minecraft server on EC2.
For a server that only turns on a few hours a month, this is extremely cost-effective.

Maybe one day I will make this entirely automatic and configurable. Until then,
I hope some of these pieces are useful to you.

# High Level: How it works
The static web page in the `site` directory is pushed to Amazon S3.
Players to go this website and hit the "Start Server" button.

The javascript on the website makes an AWS Lambda call (in the `lambda` directory).
The lambda call handles authentication and starts an Amazon EC2 instance.

The EC2 instance is a stock Ubuntu 16.04 [LTS][lts] image.
It is provisioned with [cloud-init][init].
The provisioning script installs all the software necessary to run the server, points a DNS record to the server, and downloads the current game world from S3.
The provisioning scripts and other files that end up on the server are in the `provisioning` directory.

Once the provisioning system has installed all the software required to run minecraft the node.js server boots.
The server, in the `server` directory, starts and manages the minecraft server process.

Current server features:

 * When no players have been on the server for 10 minutes, stop minecraft, save the world to S3, then power off the server.
 * TODO: Automatically back up the world to S3 every X minutes (log to in-game chat when it happens).
 * TODO: Automatically run [`overviewer.py`][overviewer] before powering off.
 * TODO: Endpoints for players on system, uptime, etc.
 * TODO: Stream chat log and/or server log via websockets to clients.
 * TODO: Allow web clients to interact with server (e.g. start backup, chat, power off, etc).

The `terraform` folder contains the code that describes other AWS infrastructure needed to glue all of the above pieces together. For example, the IAM roles, S3 buckets, and the security group for the EC2 server.

Each folder has a README that goes into more detail.
I have tried my best to document things so people that are new to coding or AWS can understand and change features if they desire.
Please report an issue if anything is unclear.

[lts]: https://wiki.ubuntu.com/LTS
[init]: https://cloudinit.readthedocs.io/en/latest/ 
[overviewer]: https://overviewer.org/


# Performance
TODO

It takes X seconds to boot

Which t2 [instance type][types] to use based on number of players.
Describe burstable CPU credits.
After a while they may run out and you realize the burst capabilities have been covering up the fact that your instance type is too small.
Fix by restarting with larger type.

[types]: https://aws.amazon.com/ec2/pricing/on-demand/

# Costs
TODO

 * Server on EC2: an EC2 t2.medium instance, sufficient to run a modded server for 4 players, runs $X/hr.
 * S3 storage: TODO link to map and say that world costs $X/mo.
 * Bandwidth: Example from my billing history.






# OLD README BELOW

## Autoupdate DNS
Unless you pay extra for a *static* Elastic IP Address your EC2 server will
be assigned a new public IP each time you start it. Use this script to tell
Route53 about the new IP every time the server boots so people can join the
game using DNS.

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

### Allow node to bind to privileged ports
Run this command to allow node to bind to ports < 1024:

    sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``

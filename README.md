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

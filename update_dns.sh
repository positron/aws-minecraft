#!/bin/sh

COMMENT="Auto updating @ `date`"
IP=`curl http://169.254.169.254/latest/meta-data/public-ipv4`

cat > ~/dns.json << EOF
{
	"Comment":"$COMMENT",
		"Changes":[
		{
			"Action":"UPSERT",
			"ResourceRecordSet":{
				"ResourceRecords":[
						{
							"Value":"$IP"
						}
					],
					"Name":"mc.philipjagielski.com",
					"Type":"A",
					"TTL":4
			}
		}
	]
}
EOF

aws route53 change-resource-record-sets --hosted-zone-id Z3MPXODB8HLF3F --change-batch file://~/dns.json

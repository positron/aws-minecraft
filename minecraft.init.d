#!/bin/sh
#
# network Bring up/down networking
#
# chkconfig: 345 20 80
# description: Starts and stops the minecraft server
#

case "$1" in
  start)
		echo -n "Starting Minecraft Server"
		/bin/su - ec2-user -c 'cd /home/ec2-user/aws-minecraft; npm start &'
		echo "."
		;;
  stop)
		echo -n "Stopping Minecraft Server"
                # TODO: use tmux
		kill `ps auxw | grep minecraft.*.jar | awk '{print $2}'`
		echo "."
		;;

  *)
		echo "Usage: service minecraft {start|stop}"
		exit 1
esac

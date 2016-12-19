# Provisioning

Use ami-e13739f6 - official 16.04 image.

This is *not* a production grade provisioning system.
Just a series of shell scripts I hacked together to work with cloud-init on EC2 and vagrant locally.

TODO:
 * Do network stuff in parallel. Each parallel script logs to it's own file, but status is reported to main log with:
   http://stackoverflow.com/questions/1570262/shell-get-exit-code-of-background-process

## Developing
To avoid stopping and starting an EC2 instance each time you want to make a change, use vagrant to test changes to the provisioning script.

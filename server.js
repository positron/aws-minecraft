#!/user/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;

var mcServer = spawn('java',
      ['-Xmx1024M', '-Xms1024M', '-jar', 'minecraft_server.1.8.8.jar', 'nogui'],
      { cwd: '/home/vagrant/bin/', stdio: ['pipe', 'pipe', 'pipe']});

mcServer.stdout.on('data', onMCData);
mcServer.stderr.on('data', onMCData);
process.stdin.on('data', onMCData);
mcServer.on('exit', function onExit() {
  console.log('Minecraft server exited');
  process.exit(0);
});

mcServer.stdout.pipe(process.stdout);
mcServer.stderr.pipe(process.stderr);
process.stdin.pipe(mcServer.stdin);

var logfile = fs.createWriteStream('log.txt');
mcServer.stdout.pipe(logfile);
mcServer.stderr.pipe(logfile);
process.stdin.pipe(logfile);

function onMCData(data) {
  // process stuff here
}

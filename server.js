#!/user/bin/env node

var spawn = require('child_process').spawn;

var mcServer = spawn('python', [], { stdio: ['inherit', 'pipe', 'pipe'] });
mcServer.stdout.on('data', onMCData);
mcServer.stderr.on('data', onMCData);
mcServer.on('exit', function onExit() {
  console.log('server exited');
});

mcServer.stdout.pipe(process.stdout);
mcServer.stderr.pipe(process.stderr);

function onMCData(data) {
  // process stuff here
}

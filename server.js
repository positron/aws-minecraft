#!/user/bin/env node

var spawn = require('child_process').spawn;

var mcServer = spawn('python', [], { stdio: ['inherit', 'inherit', 'inherit'] });

mcServer.on('exit', function onExit() {
  console.log('server exited');
});

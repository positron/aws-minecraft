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
  //spawn('sudo', ['poweroff']);
  process.exit(0);
});

mcServer.stdout.pipe(process.stdout);
mcServer.stderr.pipe(process.stderr);
process.stdin.pipe(mcServer.stdin);

var logfile = fs.createWriteStream('log.txt');
mcServer.stdout.pipe(logfile);
mcServer.stderr.pipe(logfile);
process.stdin.pipe(logfile);

// TODO: make it so people in chat can't spoof this
var join = /(\w+) joined the game/
var leave = /(\w+) left the game/
players = {};

function onMCData(data) {
   data = String(data);
   if (match = data.match(join)) {
      player = match[1];
      console.log(player + ' joined');
      players[player] = Date.now();
   } else if (match = data.match(leave)) {
      player = match[1];
      console.log(player + ' left');
      delete players[player]
   }
}

function shutdownIfNoPlayers() {
   var num_players = Object.keys(players).length;
   if (num_players == 0) {
      console.log('Shutting down server');
      mcServer.stdin.write('/stop\n');
   } else {
      console.log(num_players + ' are playing so don\'t shut down');
   }
}

setInterval(shutdownIfNoPlayers, 16 * 60 * 1000);

// Express server
var express = require('express');
var app = express();

// Enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api/players', function(req, res) {
   res.json(players);
});

app.listen(3000);

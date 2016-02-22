var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require("fs");
var port = 1313;

// Express configuration
app.use(express.static(__dirname + '/public'));   // set the static files location /public
app.use(bodyParser.json());                       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // to support URL-encoded bodies

server.listen(port);

// application -------------------------------------------------------------
app.get('*', function (req, res) {
  res.sendFile('./publish/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

io.on('connection', function (socket) {
  socket.emit("init", true);

  socket
    .on("error", function (err) {
      throw err;
    });
});
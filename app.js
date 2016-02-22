var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require('request');
var port = 1313;

// Express configuration
app.use(express.static(__dirname + '/public'));   // set the static files location /public

server.listen(port);

function getWord() {
  var source = "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=false&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=11&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
  request.get(source, function (err, data) {
    if (err) {
      throw err;
    }
    data = JSON.parse(data.body);

    this.emit("newWord", data.word);
  }.bind(this));
}

// application -------------------------------------------------------------
app.get('*', function (req, res) {
  res.sendFile('./publish/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

io.on('connection', function (socket) {
  getWord.call(socket);

  socket
    .on("getWord", function () {
      getWord.call(this);
    })
    .on("error", function (err) {
      throw err;
    });
});
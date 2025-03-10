var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const WebSocket = require("ws");
const { RTCPeerConnection, RTCSessionDescription } = require("wrtc");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const run = require('./rtsp_server');
const { feedVideoToRTSP } = require('./rtsp_stream');
const { getMediaStream } = require('./web_rtc_stream');

var app = express();
const server = require("http").createServer(app);
exports.wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  socket.on("message", async (message) => {
    const data = JSON.parse(message);

    if (data.type === "offer") {
      broadcaster = socket;

      const peer = new RTCPeerConnection();
      const stream = getMediaStream();

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
        }
      };

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.send(JSON.stringify({ type: "answer", answer }));
    }
  });
});

app.use(cors())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

run().then((e) => {
  if (e) {
    console.log("RTSP Server is Live")

    feedVideoToRTSP();
  } else {
    console.log("Failed to start RTSP Server")
  }
})

module.exports = app;

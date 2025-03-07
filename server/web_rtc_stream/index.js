const { spawn } = require('child_process');
const { wss } = require('../app');

const RTSP_URL = 'rtsp://127.0.0.1:5554/live';

exports.getMediaStream = () => {
  const { spawn } = require("child_process");

  const ffmpeg = spawn("ffmpeg", [
    "-re", "-i", "udp://127.0.0.1:1234",
    "-c:v", "libx264", "-preset", "ultrafast", "-tune", "zerolatency",
    "-c:a", "aac", "-b:a", "128k",
    "-f", "webm", "pipe:1"
  ]);

  return new MediaStream(ffmpeg.stdout);
}

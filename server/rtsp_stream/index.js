const { spawn } = require('child_process');
const path = require('path');
const Stream = require('node-rtsp-stream')

const VIDEO_PATH = path.join(__dirname, '../assets/1080p/vid.mp4');

const RTSP_URL = 'rtsp://127.0.0.1:5554/live';
const RTSP_CLIENT_URL = 'rtsp://127.0.0.1:6554/live';

let stream;

const feedVideoToRTSP = () => {

  console.log('Starting FFmpeg process to stream video...');

  const ffmpeg = spawn('ffmpeg', [
    '-re',
    '-stream_loop', '-1',
    '-i', VIDEO_PATH,
    '-vf', "drawtext=text='%{localtime}':fontsize=24:fontcolor=white:x=10:y=10",
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-tune', 'zerolatency',
    '-b:v', '2000k',
    '-maxrate', '2500k',
    '-bufsize', '5000k',
    '-g', '50',
    '-keyint_min', '50',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-f', 'rtsp',
    RTSP_URL
  ]);
  

  ffmpeg.stdout.on('data', (data) => console.log(`FFmpeg stdout: ${data}`));
  ffmpeg.stderr.on('data', (data) => console.error(`FFmpeg stderr: ${data}`));
  ffmpeg.on('close', (code) => console.log(`FFmpeg process exited with code ${code}`));

  return ffmpeg;
};

const startRTSPStream = (req, res) => {

  const isStart = req.body.isStart;

  // if requested to stop the stream
  if (!isStart) {
    stream.stop();
    stream = null;

    return res.status(200).json({ message: "Stream Stopped" });
  }

  // Stop the existing stream if requested or if the URL changes
  if (stream && isStart) {
    stream.stop();
    stream = null;
  }

  stream = new Stream({
    name: 'WSTN',
    streamUrl: RTSP_CLIENT_URL,
    wsPort: 9999,
    ffmpegOptions: {
      '-r': 30,
      '-b:v': '4M',
      '-preset': 'medium',
      '-tune': 'zerolatency',
      '-an': '',
      '-analyzeduration': 10000000,
      '-probesize': 5000000,
      '-ignore_unknown': ""
    }
  })

  return res.status(200).json({ url: `ws://127.0.0.1:9999` });
};

module.exports = {
  feedVideoToRTSP,
  startRTSPStream
}
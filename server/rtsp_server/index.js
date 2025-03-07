const RtspServer = require('rtsp-streaming-server').default;

const server = new RtspServer({
  serverPort: 5554,
  clientPort: 6554,
  rtpPortStart: 10000,
  rtpPortCount: 10000
});


const run = async () => {
  try {
    await server.start();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

module.exports = run;
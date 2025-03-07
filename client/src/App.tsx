import JSMpeg from "@cycjimmy/jsmpeg-player";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

function App() {
  const [url, setUrl] = useState<null | string>(null);
  const [timestamp, setTimestamp] = useState<string>(new Date().toLocaleString(undefined, { hour12: false }));

  const canvas = useRef<HTMLCanvasElement | null>(null);
  const player = useRef<any>(null);
  const socket = useRef<WebSocket | null>(null);
  const dataLoading = useRef<boolean>(true);

  const startStream = async () => {
    const response = await axios.post("http://localhost:3000/start", {
      isStart: true,
    });

    if (response.status === 200 && response.data.url) {
      setUrl(response.data.url);
    }
  };

  const stopStream = async () => {
    const response = await axios.post("http://localhost:3000/start", {
      isStart: false,
    });

    if (response.status === 200) {
      setUrl(null);

      window.alert("Stream Stopped Successfully");
    }
  };

  useEffect(() => {
    if (canvas.current && url) {
      player.current = new JSMpeg.Player(url, {
        canvas: canvas.current,

        preserveDrawingBuffer: true,

        onVideoDecode: () => {
          if (dataLoading.current) {
            dataLoading.current = false;

            window.alert("Data Loaded");
          }
        },
      });

      socket.current = new WebSocket(url);
    }
  }, [url]);

  useEffect(() => {
    return () => {
      stopStream().then(() => {});

      if (player.current) {
        console.log("Destroying player");

        player.current.stop();
        player.current.destroy();
        player.current = null;

        console.log("Player destroyed");
      }

      if (socket.current) {
        console.log("Closing socket");

        socket.current.close();
        socket.current = null;

        console.log("Socket closed");
      }

      if (canvas.current) {
        canvas.current.getContext("2d")?.clearRect(0, 0, canvas.current.width, canvas.current.height);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString(undefined, { hour12: false }));
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div
      style={{
        backgroundColor: "black",
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <span style={{ color: "white", fontSize: "16px" }}>System Timestamp: {timestamp}</span>
      <div
        style={{
          width: "min(90%, min(720px, 90vh*(9 / 16)))",
          maxWidth: "720px",
          maxHeight: "1280px",
          aspectRatio: "9 / 16", // Keeps the correct aspect ratio
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: url ? "none" : "2px dashed white",
          overflow: "hidden",
        }}
      >
        {url ? (
          <canvas
            ref={canvas}
            style={{
              width: "100%",
              height: "100%", // Ensures it fits in the div without overflow
              objectFit: "contain", // Keeps aspect ratio inside
            }}
          />
        ) : (
          <span style={{ color: "white" }}>Waiting to Start Stream</span>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button onClick={startStream}>Start Stream</button>
        <button onClick={stopStream}>Stop Stream</button>
      </div>
    </div>
  );
}

export default App;

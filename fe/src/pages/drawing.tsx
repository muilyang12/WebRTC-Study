import { useState, useEffect, PointerEvent, createElement } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import useCanvasDrawing from "@/hooks/pages/paint/useCanvasDrawing";
import useWebRtcConnecting from "@/hooks/pages/common/useWebRtcConnecting";

export default function Drawing() {
  const router = useRouter();
  const { roomName, userName } = router.query;

  const { socket, rtcConnection } = useWebRtcConnecting({
    roomName: Array.isArray(roomName) ? roomName[0] : roomName,
  });

  useEffect(() => {
    if (!socket) return;

    socket.emit("create_room", roomName);
    console.log("create_room");
  }, [socket]);

  const [drawingDataChannel, setDrawingDataChannel] = useState<RTCDataChannel>();
  useEffect(() => {
    if (!rtcConnection) return;

    const drawingDataChannel = rtcConnection.createDataChannel(`${roomName}-drawingDataChannel`);

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    let mark: HTMLDivElement;

    drawingDataChannel.addEventListener("open", () => {
      console.log("Channel opened");

      canvas = document.querySelector("#canvas") as HTMLCanvasElement;
      canvas.width = canvas.getBoundingClientRect().width;
      canvas.height = canvas.getBoundingClientRect().height;

      context = canvas.getContext("2d") as CanvasRenderingContext2D;
      context.strokeStyle = "#000000";
      context.lineWidth = 2.5;

      context.beginPath();

      mark = document.createElement("div");
      mark.style.fontSize = "20px";
      mark.style.position = "absolute";
      mark.style.top = `-20px`;
      mark.style.left = `-20px`;
      mark.style.width = "30px";
      mark.style.height = "30px";
      mark.style.textAlign = "center";
      mark.style.border = "1px solid black";

      document.body.appendChild(mark);
    });

    drawingDataChannel.addEventListener("message", (event) => {
      const parsedData = JSON.parse(event.data);

      const x = parsedData.relativeX * canvas.width;
      const y = parsedData.relativeY * canvas.height;

      const userName = parsedData.userName;

      const element = document.createElement("div");
      element.innerHTML = userName;
      element.style.fontSize = "20px";
      element.style.position = "absolute";
      element.style.top = `${y}px`;
      element.style.left = `${x}px`;

      mark.innerHTML = userName;
      mark.style.top = `${y}px`;
      mark.style.left = `${x}px`;

      if (parsedData.isPainting) {
        context.lineTo(x, y);
        context.stroke();
      } else {
        context.beginPath();
        context.moveTo(x, y);
      }
    });

    setDrawingDataChannel(drawingDataChannel);
  }, [rtcConnection]);

  useCanvasDrawing({
    drawingDataChannel,
    color: "#000000",
    lineWidth: 2.5,
    userName: Array.isArray(userName) ? userName[0] : userName,
  });

  return (
    <>
      <canvas id="canvas" />

      <style jsx>{`
        button {
          position: absolute;
          top: 0;
          left: 0;
          padding: 5px 10px;

          font-size: 20px;
        }

        #canvas {
          width: 100%;
          height: 100vh;
        }
      `}</style>
    </>
  );
}

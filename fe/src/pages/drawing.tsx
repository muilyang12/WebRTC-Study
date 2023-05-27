import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useCanvasDrawing from "@/hooks/pages/paint/useCanvasDrawing";
import useWebRtcConnecting from "@/hooks/pages/common/useWebRtcConnecting";
import { createNameLabel, updateNameLabel } from "@/utils/nameLabelUtils";

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

      mark = createNameLabel();

      document.body.appendChild(mark);
    });

    drawingDataChannel.addEventListener("message", (event) => {
      const parsedData = JSON.parse(event.data);

      const x = parsedData.relativeX * canvas.width;
      const y = parsedData.relativeY * canvas.height;

      const userName = parsedData.userName;

      updateNameLabel(mark, userName, x, y);

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

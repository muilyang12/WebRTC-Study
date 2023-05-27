import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useCanvasDrawing from "@/hooks/pages/paint/useCanvasDrawing";
import useWebRtcConnecting from "@/hooks/pages/common/useWebRtcConnecting";
import { createNameLabel, updateNameLabel } from "@/utils/nameLabelUtils";

export default function Drawing() {
  const router = useRouter();
  const { roomName, userName } = router.query;

  const markRef = useRef<HTMLDivElement>(null);

  const { socket, rtcConnection } = useWebRtcConnecting({
    roomName: Array.isArray(roomName) ? roomName[0] : roomName,
  });

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_room", roomName);
    console.log("join_room");
  }, [socket]);

  const [drawingDataChannel, setDrawingDataChannel] = useState<RTCDataChannel>();
  useEffect(() => {
    if (!rtcConnection) return;

    let mark: HTMLDivElement;

    rtcConnection.addEventListener("datachannel", (event) => {
      const drawingDataChannel = event.channel;

      let canvas: HTMLCanvasElement;
      let context: CanvasRenderingContext2D;

      drawingDataChannel.addEventListener("open", () => {
        console.log("Channel opened");

        canvas = document.querySelector("#canvas") as HTMLCanvasElement;
        canvas.width = canvas.getBoundingClientRect().width;
        canvas.height = canvas.getBoundingClientRect().height;

        context = canvas.getContext("2d") as CanvasRenderingContext2D;
        context.strokeStyle = "#ff0000";
        context.lineWidth = 5;

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
    });
  }, [rtcConnection]);

  useCanvasDrawing({
    drawingDataChannel,
    color: "#ff0000",
    lineWidth: 5,
    userName: Array.isArray(userName) ? userName[0] : userName,
  });

  return (
    <>
      <canvas id="canvas" />

      <style jsx>{`
        #canvas {
          width: 100%;
          height: 100vh;
        }
      `}</style>
    </>
  );
}

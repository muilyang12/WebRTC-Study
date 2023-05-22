import { useState, useEffect, PointerEvent } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import useCanvasDrawing from "@/hooks/pages/paint/useCanvasDrawing";

export default function Drawing() {
  const router = useRouter();
  const { roomName } = router.query;

  const [socket, setSocket] = useState<Socket>();
  const [rtcConnection, setRtcConnection] = useState<RTCPeerConnection>();
  const [drawingDataChannel, setDrawingDataChannel] = useState<RTCDataChannel>();

  useEffect(() => {
    if (!roomName) return;
    if (!process.env.API_BASE_URI) throw new Error("Invalid server URI");

    const socket = io(process.env.API_BASE_URI);
    const rtcConnection = new RTCPeerConnection();

    socket.on("someone_joined", async () => {
      console.log("Someone joined. :)");

      const offer = await rtcConnection.createOffer();
      rtcConnection.setLocalDescription(offer);
      socket.emit("send_offer", offer, roomName);
      console.log("send_offer");
    });

    socket.on("receive_answer", (answer: RTCSessionDescriptionInit) => {
      console.log("receive_answer");
      rtcConnection.setRemoteDescription(answer);
    });

    rtcConnection.addEventListener("icecandidate", (data: RTCPeerConnectionIceEvent) => {
      socket.emit("send_candidate", data.candidate, roomName);
      console.log("send_candidate");
    });

    socket.on("receive_candidate", (candidate: RTCIceCandidate) => {
      console.log("receive_candidate");
      rtcConnection.addIceCandidate(candidate);
    });

    setRtcConnection(rtcConnection);
    setSocket(socket);
  }, [roomName]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("create_room", roomName);
    console.log("create_room");
  }, [socket]);

  useEffect(() => {
    if (!rtcConnection) return;

    const drawingDataChannel = rtcConnection.createDataChannel(`${roomName}-drawingDataChannel`);

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    drawingDataChannel.addEventListener("open", () => {
      console.log("Channel opened");

      canvas = document.querySelector("#canvas") as HTMLCanvasElement;
      canvas.width = canvas.getBoundingClientRect().width;
      canvas.height = canvas.getBoundingClientRect().height;

      context = canvas.getContext("2d") as CanvasRenderingContext2D;
      context.strokeStyle = "#000000";
      context.lineWidth = 2.5;

      context.beginPath();
    });

    drawingDataChannel.addEventListener("message", (event) => {
      const parsedData = JSON.parse(event.data);

      const x = parsedData.relativeX * canvas.width;
      const y = parsedData.relativeY * canvas.height;

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

  useCanvasDrawing({ drawingDataChannel, color: "#000000", lineWidth: 2.5 });

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

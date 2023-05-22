import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import useSendCanvasDrawing from "@/hooks/pages/paint/useSendCanvasDrawing";

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

    socket.on("receive_offer", async (offer: RTCSessionDescriptionInit) => {
      console.log("receive_offer");
      rtcConnection.setRemoteDescription(offer);

      const answer = await rtcConnection.createAnswer();
      rtcConnection.setLocalDescription(answer);

      socket.emit("send_answer", answer, roomName);
      console.log("send_answer");
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

    socket.emit("join_room", roomName);
    console.log("join_room");
  }, [socket]);

  useEffect(() => {
    if (!rtcConnection) return;

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
    });
  }, [rtcConnection]);

  useSendCanvasDrawing({ drawingDataChannel, color: "#ff0000", lineWidth: 5 });

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

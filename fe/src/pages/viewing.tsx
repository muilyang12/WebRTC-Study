import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

export default function Drawing() {
  const router = useRouter();
  const { roomName } = router.query;

  const [socket, setSocket] = useState<Socket>();
  const [drawingDataChannel, setDrawingDataChannel] = useState<RTCDataChannel>();

  useEffect(() => {
    if (!roomName) return;
    if (!process.env.API_BASE_URI) throw new Error("Invalid server URI");

    const socket = io(process.env.API_BASE_URI);
    const rtcConnection = new RTCPeerConnection();

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    socket.on("receive_offer", async (offer: RTCSessionDescriptionInit) => {
      console.log("receive_offer");

      rtcConnection.addEventListener("datachannel", (event) => {
        const drawingDataChannel = event.channel;

        drawingDataChannel.addEventListener("open", () => {
          console.log("Channel opened");

          canvas = document.querySelector("#viewing-canvas") as HTMLCanvasElement;
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

          context.lineTo(x, y);
          context.stroke();
        });

        setDrawingDataChannel(drawingDataChannel);
      });

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

    setSocket(socket);
  }, [roomName]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_room", roomName);
    console.log("join_room");
  }, [socket]);

  return (
    <>
      <canvas id="viewing-canvas" />

      <style jsx>{`
        #viewing-canvas {
          width: 100%;
          height: 100vh;
        }
      `}</style>
    </>
  );
}

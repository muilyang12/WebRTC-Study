import { useState, useEffect, PointerEvent } from "react";
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

    socket.on("someone_joined", async () => {
      console.log("Someone joined. :)");

      const drawingDataChannel = rtcConnection.createDataChannel(`${roomName}-drawingDataChannel`);
      drawingDataChannel.addEventListener("open", () => {
        console.log("Channel opened");
      });

      setDrawingDataChannel(drawingDataChannel);

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

    setSocket(socket);
  }, [roomName]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("create_room", roomName);
    console.log("create_room");
  }, [socket]);

  const handleClickButton = () => {
    drawingDataChannel?.send("Data");
  };

  useEffect(() => {
    if (!drawingDataChannel) return;

    const canvas = document.querySelector("#drawing-canvas") as HTMLCanvasElement;

    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.strokeStyle = "#000000";
    context.lineWidth = 2.5;

    let isPainting = false;

    const startDrawing = () => {
      isPainting = true;
    };
    const stopDrawing = () => {
      isPainting = false;
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    canvas.addEventListener("pointermove", (event) => {
      const x = event.offsetX;
      const y = event.offsetY;

      if (isPainting) {
        context.lineTo(x, y);
        context.stroke();

        const relativeX = x / canvas.getBoundingClientRect().width;
        const relativeY = y / canvas.getBoundingClientRect().height;

        const data = { relativeX, relativeY };
        drawingDataChannel.send(JSON.stringify(data));
      } else {
        context.beginPath();
        context.moveTo(x, y);
      }
    });
  }, [drawingDataChannel]);

  return (
    <>
      <button onClick={handleClickButton}>Send</button>
      <canvas id="drawing-canvas" />

      <style jsx>{`
        button {
          position: absolute;
          top: 0;
          left: 0;
          padding: 5px 10px;

          font-size: 20px;
        }

        #drawing-canvas {
          width: 100%;
          height: 100vh;
        }
      `}</style>
    </>
  );
}

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

export default function Screen() {
  const router = useRouter();
  const { roomName } = router.query;

  const [socket, setSocket] = useState<Socket>();
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

    socket.on("receive_candidate", (candidate: RTCIceCandidate) => {
      console.log("receive_candidate");
      rtcConnection.addIceCandidate(candidate);
    });

    rtcConnection.addEventListener("icecandidate", (data: RTCPeerConnectionIceEvent) => {
      socket.emit("send_candidate", data.candidate, roomName);
      console.log("send_candidate");
    });

    rtcConnection.addEventListener("addstream", (data: any) => {
      if (!videoRef.current) throw new Error("No video element.");
      console.log("addstream");

      videoRef.current.srcObject = data.stream;
    });

    setSocket(socket);
  }, [roomName]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!socket) return;

    joinRoom();
  }, [socket]);

  const joinRoom = () => {
    if (!socket) return;

    socket.emit("join_room", roomName);
    console.log("join_room");
  };

  return <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100vh" }} />;
}

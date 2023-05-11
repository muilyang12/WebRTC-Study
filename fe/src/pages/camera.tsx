import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

export default function Camera() {
  const router = useRouter();
  const { roomName } = router.query;

  const videoRef = useRef<HTMLVideoElement>(null);

  const [socket, setSocket] = useState<Socket>();
  useEffect(() => {
    if (!roomName) return;
    if (!process.env.API_BASE_URI) throw new Error("Invalid server URI");

    const socket = io(process.env.API_BASE_URI);
    const rtcConnection = new RTCPeerConnection();

    socket.on("someone_joined", async () => {
      console.log("Someone joined. :)");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      stream.getTracks().forEach((track) => rtcConnection.addTrack(track, stream));

      const offer = await rtcConnection.createOffer();
      rtcConnection.setLocalDescription(offer);
      socket.emit("send_offer", offer, roomName);
      console.log("send_offer");
    });

    socket.on("receive_answer", (answer: RTCSessionDescriptionInit) => {
      console.log("receive_answer");
      rtcConnection.setRemoteDescription(answer);
    });

    socket.on("receive_candidate", (candidate: RTCIceCandidate) => {
      console.log("receive_candidate");
      rtcConnection.addIceCandidate(candidate);
    });

    rtcConnection.addEventListener("icecandidate", (data: RTCPeerConnectionIceEvent) => {
      socket.emit("send_candidate", data.candidate, roomName);
      console.log("send_candidate");
    });

    setSocket(socket);
  }, [roomName]);

  useEffect(() => {
    if (!socket) return;

    showVideoOnCamera();
  }, [socket]);

  const showVideoOnCamera = async () => {
    try {
      if (!socket) return;
      if (!videoRef.current) throw new Error("No video element exists.");

      socket.emit("create_room", roomName);
      console.log("create_room");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      videoRef.current.srcObject = stream;
    } catch (e) {
      console.log(e);
    }
  };

  return <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100vh" }} />;
}

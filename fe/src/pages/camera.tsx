import { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import useWebRtcConnecting from "@/hooks/pages/common/useWebRtcConnecting";

export default function Camera() {
  const router = useRouter();
  const { roomName } = router.query;

  const videoRef = useRef<HTMLVideoElement>(null);

  const { socket, rtcConnection } = useWebRtcConnecting({
    roomName: Array.isArray(roomName) ? roomName[0] : roomName,
  });

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

  useEffect(() => {
    if (!rtcConnection) return;

    shareCamera();
  }, [rtcConnection]);

  const shareCamera = async () => {
    if (!rtcConnection) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    stream.getTracks().forEach((track) => rtcConnection.addTrack(track, stream));
  };

  return <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100vh" }} />;
}

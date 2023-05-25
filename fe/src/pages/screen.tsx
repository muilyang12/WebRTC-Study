import { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import useWebRtcConnecting from "@/hooks/pages/common/useWebRtcConnecting";

export default function Screen() {
  const router = useRouter();
  const { roomName } = router.query;

  const { socket, rtcConnection } = useWebRtcConnecting({
    roomName: Array.isArray(roomName) ? roomName[0] : roomName,
  });

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

  useEffect(() => {
    if (!rtcConnection) return;

    rtcConnection.addEventListener("addstream", (data: any) => {
      if (!videoRef.current) throw new Error("No video element.");
      console.log("addstream");

      videoRef.current.srcObject = data.stream;
    });
  }, [rtcConnection]);

  return <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100vh" }} />;
}

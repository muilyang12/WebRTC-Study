import { useState, useEffect, useRef, ChangeEvent } from "react";
import { io, Socket } from "socket.io-client";

const ROOM_OWNER = 1;

export default function Home() {
  const [roomName, setRoomName] = useState("moore");
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value);

  const doneFunc = () => {
    console.log("Done !!");
  };

  const [socket, setSocket] = useState<Socket>();
  const [rtcConnection, setRtcConnection] = useState<RTCPeerConnection>();
  useEffect(() => {
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

    socket.on("receive_offer", async (offer: RTCSessionDescriptionInit) => {
      console.log("receive_offer");
      rtcConnection.setRemoteDescription(offer);

      const answer = await rtcConnection.createAnswer();
      rtcConnection.setLocalDescription(answer);
      socket.emit("send_answer", answer, roomName);
      console.log("send_answer");
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

    rtcConnection.addEventListener("addstream", (data: any) => {
      if (!videoRef.current) throw new Error("No video element.");
      console.log("addstream");

      videoRef.current.srcObject = data.stream;
    });

    setSocket(socket);
    setRtcConnection(rtcConnection);
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCreateRoomButtonClick = async () => {
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

  const handleJoinRoomButtonClick = () => {
    if (!socket) return;

    socket.emit("join_room", roomName);
    console.log("join_room");
  };

  return (
    <>
      <hr />
      <div className="inputs">
        User: <input type="text" />
        <br />
        Room Name:
        <input type="text" value={roomName} onChange={handleChange} />
      </div>
      <div className="button-wrapper">
        <button onClick={handleCreateRoomButtonClick}>Create Room</button>
      </div>
      <div className="button-wrapper">
        <button onClick={handleJoinRoomButtonClick}>Join Room</button>
      </div>
      <video ref={videoRef} autoPlay playsInline width={400} height={400} />

      <style jsx>
        {`
          .inputs {
            font-size: 30px;

            margin: 30px 20px;
          }

          .inputs > input[type="text"] {
            width: 100px;
            height: 50px;
          }

          .button-wrapper,
          .button-wrapper > button {
            width: 300px;
            height: 50px;
            font-size: 30px;
          }
        `}
      </style>
    </>
  );
}

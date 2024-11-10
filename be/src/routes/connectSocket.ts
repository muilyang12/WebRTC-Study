const socketIO = require("socket.io");
const createRoom = require("../services/socket/createRoom");
const joinRoom = require("../services/socket/joinRoom");

module.exports = (server) => {
  const isDev = process.env.NODE_ENV !== "production";

  const io = new socketIO.Server(server, {
    cors: {
      origin: isDev ? "http://localhost:3333" : "",
      optionsSuccessStatus: 200,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("create_room", (roomName, done) => createRoom(socket, roomName));

    socket.on("join_room", (roomName, done) => joinRoom(socket, roomName));

    socket.on("send_offer", (offer: RTCSessionDescriptionInit, roomName: string) => {
      socket.to(roomName).emit("receive_offer", offer);
    });

    socket.on("send_answer", (answer: RTCSessionDescriptionInit, roomName: string) => {
      socket.to(roomName).emit("receive_answer", answer);
    });

    socket.on("send_candidate", (candidate: RTCIceCandidate, roomName: string) => {
      socket.to(roomName).emit("receive_candidate", candidate);
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => {
        socket.to(room).emit("send_bye");
      });
    });

    socket.on("disconnect", () => {
      console.log("User has left.");
    });
  });
};

module.exports = (socket, roomName) => {
  socket.join(roomName);

  socket.to(roomName).emit("someone_joined");
};

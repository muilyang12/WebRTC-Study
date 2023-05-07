module.exports = (socket, roomName, done) => {
  socket.join(roomName);
  done();

  console.log(socket.rooms);

  socket.to(roomName).emit("send_welcome");
};

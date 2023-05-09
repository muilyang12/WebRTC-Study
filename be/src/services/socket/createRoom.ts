module.exports = async (socket, roomName) => {
  socket.join(roomName);

  console.log(socket.rooms);
};

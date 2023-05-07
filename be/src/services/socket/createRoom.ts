module.exports = async (socket, roomName, done) => {
  socket.join(roomName);
  done();

  console.log(socket.rooms);
};

export {};

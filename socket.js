let io;

module.exports = {
  init: httpServer => {
console.log('sssssssss')
    io = require("socket.io")(httpServer);
    console.log('someone connected');

    return io
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket Not Initialized')
    }
    return io;
  }
};

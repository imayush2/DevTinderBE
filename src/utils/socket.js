const server = http.createServer(app);

const iniatializeSocket = (server) => {
  const socket = require("socket.io");

  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    //handle events
  });
};

module.exports = iniatializeSocket;

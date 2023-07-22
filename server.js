const io = require("socket.io");
const http = require("http");

const apiServer = require("./api.js");
const socket = require("./socket.js");

const httpServer = http.createServer(apiServer);
const socketServer = io(httpServer, {
  cors: {
    origin: "*",
    method: ["GET", "POST"],
  },
});

const PORT = 3000;

httpServer.listen(PORT);

console.log("listening on port 3000");

socket.listen(socketServer);

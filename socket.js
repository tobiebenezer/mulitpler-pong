function listen(io){
    let readyPlayerCount = 0;
    let room;
    const pongNameSpace = io.of('/pong');
    pongNameSpace.on("connection", (socket) => {
      console.log("a user is connected " + socket.id);

      room = 'room '+ Math.floor(readyPlayerCount/2) 
      socket.on("ready", () => {
          socket.join(room);
          console.log("Player " + socket.id + "is Ready","player joined "+room);
        readyPlayerCount++;
        if (readyPlayerCount % 2 === 0) {
          pongNameSpace.in(room).emit("startGame", socket.id);
        }
      });

      socket.on("paddleMove", (paddleData) => {
        socket.to(room).emit("paddleMove", paddleData);
      });

      socket.on("ballMove", (ballData) => {
        socket.to(room).emit("ballMove", ballData);
      });

      socket.on('disconnect',(reason)=>{
        console.log(`Client ${socket.id} disconnected: ${reason}`);
        socket.leave(room)
      })
    });
}

module.exports = {listen};
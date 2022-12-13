let io;
let currentUser
let idUser
let socketRooms
exports.socketConnection = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: "*",
    methods: ["GET", "POST"],
    credentials: false
    },
    allowEIO3: true
  });
  let roomForFriends
 
  io.on('connection', (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    socket.emit("getSocketId", socket.id)
    socket.join(socket.id)
    idUser = socket.id
    socket.on("sendUserToServer", (user, time1,room)=>{
        currentUser = user
        currentUser.friends.forEach(friend =>{
          socketRooms = [...io.sockets.adapter.rooms.keys()]
          console.log(socketRooms)
          if(socketRooms.includes(`${currentUser.email + friend.email }`|| `${friend.email + currentUser.email}`   )){
            socket.join(currentUser.email + friend.email)
          }
          else {socket.join(friend.email + currentUser.email)}
          console.log(io.sockets.adapter.rooms)
          io.to(currentUser.email + friend.email).emit("userConnected",`user ${currentUser.name} has connected`)
        })
        currentUser.time1 = time1
    })
    socket.on("getRooms", () => {
      socket.emit("returnRooms", socketRooms)
    })
    
    socket.on('disconnect', () => {
        console.log(currentUser)
        currentUser.time2 = Date.now()
        let timeOnline = currentUser.time2 - currentUser.time1
        currentUser.friends.forEach(friend =>{
        io.to(currentUser.email + friend.email).emit("userDisconnected",`user ${currentUser.name} has disconnected`, `he stayed online for ${timeOnline/1000/60} minutes`)
        })
      console.info(`Client disconnected [id=${socket.id}]`);
    });
  });
};
exports.sendFriendInfo = (user, room) => io.to(idUser).emit("sendUserInfo", user, room);

exports.sendMessage = (message, room) => io.to(room).emit("sendMessage", message, room);

exports.getRooms = () => io.sockets.adapter.rooms;
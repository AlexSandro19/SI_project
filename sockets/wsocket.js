// const { use } = require("passport");
const user = require("./models/user")
require("dotenv").config();
const {connection} = require("./db.js");

const io = require("socket.io")(3000, {
    cors: {
      origin: "*",
    methods: ["GET", "POST"],
    credentials: false
    },
    allowEIO3: true
  })

    let Person
    
    let activeFriendsList = []
    io.on("connection", async (socket)  => {
      
      socket.emit("serverEvent-1", socket.person)
      console.log(socket.person)
      socket.on("default", friends =>{
        console.log(friends)
      })
      socket.on("getTimeOne", (person,time1) =>{
        //activeFriendsList.push(person)
          /*person.friendlist.forEach(async friend =>{
          await socket.join(friend.socketID)*/
          console.log(`joined `)
      }/*)*/
      )
      socket.on("disconnect", () =>{
        let time2 = Date.now()
        console.log(time2)
        socket.emit("timeOnlineFromServer", time2)
        
      })
      socket.on("sendUser", username =>{
        console.log(username)
      })
    })
    
  

exports.module = io
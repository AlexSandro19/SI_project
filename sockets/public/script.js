
let currentUser
const socket = io("http://localhost:8000",{
    withCredentials: false,
})
let socketId 
socket.on("connect",  ()=>{
    console.log("1.socket connected")
    socket.on("getSocketId", id => {
        console.log("socketId received")
    })
    console.log("outside second socket , before 2nd emit")
})
socket.on("sendUserInfo", (user,room)=>{
    currentUser = user
    socket.emit("getRooms")
    socket.on("returnRooms", rooms =>{
        console.log(rooms)
    })
    let time1 = Date.now()
    console.log("USERRRRRRRRRRRRRRRRR",currentUser)
    socket.emit("sendUserToServer", currentUser, time1,room)
    
})
socket.on("userDisconnected", (message1,message2)=>{
    console.log(message1)
    console.log(message2)
    
})
socket.on("userConnected", (message1)=>{
    console.log(message1)
    
})
socket.on("sendMessage", (message, room) => {
    console.log(message,room)
})

/*socket.on('serverEvent-1', id => {
    console.log("outside connect")
    let nr =  Math.floor(Math.random() * 5 + 1)
    let randAlex = personsList[nr] 
    randAlex.socketID = id
    let time1 = Date.now()
    socket.emit("getTimeOne", randAlex,time1)
})*/
//time online on client
socket.on('timeOnlineFromServer', time2 => {
    console.log(time2/1000)
    socket.broadcast.emit("FriendIsOffline",timeOnline)
})


//frontend stuff

const messageForm = document.getElementById("message-container")
const userInput = document.getElementById("userInput")

messageForm.addEventListener("submit", e =>{
    e.preventDefault()
    const username = userInput.value
    socket.on("getRooms", rooms => {
        console.log(rooms)
    })
    socket.emit("sendUser", username)
    userInput.value = ""

})



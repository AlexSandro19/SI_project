// const passport = require('./passport.js');
const express = require('express');
const app = express();
const http = require('http');
const {connection} = require("./db.js");
const bodyParser = require('body-parser')
const cors = require('cors')
const { socketConnection, sendFriendInfo } = require('./socket-io');
const { sendMessage } = require('./socket-io');
// or use require if you prefer
//const swaggerUi = require('swagger-ui-express')
//const swaggerDocument = require('./swagger.json');
//var User = require('../models/user');
const PORT = 8003;
require("dotenv").config();
const user = require("./models/user.js");
const invite = require("./models/invite.js");
// Auth ---- username, socket.on( (username)) ) return list of friends   1.call database
// Track activity . Socket { room(id) } track 
//const {io}  = require("./wsocket.js");
const User = require('./models/user.js');
const server = http.createServer(app);
socketConnection(server);
// app.use(
// '/api-docs',
// swaggerUi.serve, 
// swaggerUi.setup(swaggerDocument)
// );
// module.exports = function(app, passport) {
  app.use( bodyParser.json() );       // to support JSON-encoded bodies

  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
   extended: true})); 
  app.use(cors())

app.post('/signup',(req, res) => {
    console.log(req.user);
  res.json({return:"HELLO"})});

app.post('/login', /*passport.authenticate('local', { failureRedirect: '/' })*/ async (req, res) => {
    const userEmail = req.body.email
    const users = await user.findBy([{ key: "email", value: userEmail }],
    {
    with_related: ['!IS_fRIEND', 'friends'], // ! = force to have the relation
    state: { language: 'pt-BR'} // force the state inside all models
   })
    console.log("USERS", users['0'].friends)
    const room = Math.random() * 1000000000
    sendFriendInfo(users["0"],room);
 
  res.json({return:"Password correct"})
});

    /*app.get('/', (req, res) => {
        res.send('Hello World!')
      })
      
      app.post('/login2', (req, res) =>{
        
        console.log("req.body")   
        console.log(req.body)   
    })*/
 app.get("/testDB", async (req, res) => {
    const session =connection()
    const Pavel = await user.findAll({with_related: ['friends']})
    console.log(Pavel)
    const Invite = await invite.findAll({with_related: ['sender', 'receiver']})
    //session.run("MATCH (n) return n").then(records=>records.records.forEach(record=>console.log(record.get('n'))))
    res.json({return:Pavel, invite:Invite})
    })

    server.listen(PORT, () => {
        console.log(`Server is running on port`, PORT)
    });
    


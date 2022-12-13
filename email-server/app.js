const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json');
const streamHandler = require('./utils/streamHandler');
const PORT = process.env.PORT || 8001;
require("dotenv").config();
const { delay, ServiceBusClient } = require("@azure/service-bus");
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
const topicName = process.env.TOPIC_NAME;
const subscriptionName = process.env.SUBSCRIPTION_NAME;
const {
  connection
} = require("./db")
const {
  linkGenerator,
  decodeLink
} = require("./utils/linkgeneration");
const emailHandler = require("./utils/emailHandler");
const {
  create
} = require("./models/relationships")
const Invite = require('./models/invite');
const User = require("./models/user");
app.use(express.json({
  limit: "30mb",
  extended: true
}));
app.use(express.urlencoded({
  limit: "30mb",
  extended: true
}));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.listen(PORT, () => {
  console.log(`Server is running on port`, PORT);
});
app.post("/createUser", async (req, res) => {
  try {
    const {
      email,
      name
    } = req.body
    const user = await User.findBy([{
      key: "email",
      value: email
    }])
    if (user[0]) {
      return res.status(500).json({
        message: "User already exists"
      })
    }
    const addUser = new User({
      name: name,
      email: email,
    })
    const id = await addUser.save();
    if (!addUser.isValid()) {
      // in user.errors will have the errors
      console.log(invite.errors);
      res.status(500).json({
        message: "Internal Server Error"
      })
    }
    return res.status(200).json({
      addUser
    });
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
})
app.post("/sendInvite", async (req, res) => {
  try {
    const {
      inviter_email,
      receiver_email
    } = req.body
    let user = await User.findBy([{
      key: "email",
      value: inviter_email
    }])
    user = user[0]
    if (!user) {
      console.log("Sender does not exists")
      user = new User({
        name: "",
        email: inviter_email,
      })
      const id = await user.save();
      if (!user.isValid()) {
        // in user.errors will have the errors
        console.log(user.errors);
        return res.status(500).json({
          message: "ERROR"
        })
      }
    }

    console.log(user.id);
    console.log(receiver_email);
    let invite = await Invite.findBy([{
      key: "user_id",
      value: user.id,
      key: "invited_email",
      value: receiver_email
    }])
    console.log(!invite[0]);
    if (!invite[0]) {
      invite = new Invite({
        user_id: user.id,
        status: 'INVITED',
        expiration: 111111,
        invited_email: receiver_email,
        token: "",
      });
      if (!invite.isValid()) {
        // in user.errors will have the errors
        console.log(invite.errors);
        return res.status(500).json({
          message: "ERROR"
        })
      }
      await invite.save()
    } else {
      console.log("HERE")
      return res.status(500).json({
        message: "User was already invited or added as a friend"
      })
    }
    let checkInvited = await User.findBy([{
      key: "email",
      value: receiver_email
    }])
    checkInvited = checkInvited[0]
    if (!checkInvited) {
      console.log("Receiver does not exists")
      checkInvited = new User({
        name: "",
        email: receiver_email
      })
      if (!checkInvited.isValid()) {
        // in user.errors will have the errors
        console.log(checkInvited.errors);
        res.status(500).json({
          message: "ERROR"
        })
      }
      const newUser_id = await checkInvited.save();
      const inviteLink = await linkGenerator(invite.id, receiver_email, inviter_email)
      const state = emailHandler(receiver_email, inviteLink, user)
      console.log(inviteLink);
    }
    await create(user, invite, "SENDS")
    await create(invite, checkInvited, "WAS_INVITED")
    await create(user, checkInvited, "IS_FRIEND")

    return res.status(200).json({
      message: "Added a friend"
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server Error",
      errors: [{
        value: e,
        msg: e.message,
      }, ],
    });
  }

})
app.get("/confirmation/:link",async(req,res)=>{
  try{
    const {link}= req.params
    console.log(link);
    const decoded = await decodeLink(link);
    const user = await User.findBy([{key:"email",value:decoded.inviter_email}])
    const invite = await Invite.findByID(decoded.id)
    console.log(user[0])
    console.log(invite)
    //await User.findOne({confirmationHash:hash});
  
    if(invite && user){
      if(invite.status === "CLOSED"){
        return res.status(500).json({message:"Email was already confirmed",emailConfirmed:true})
      }
      invite.status = 'ACCEPTED'
      //make post request to /user/:data to get their token and url and then redirect to their page
      await invite.save();
      const json = await streamHandler()
      console.log(json.urls)
      const response = await fetch(`${json.urls[0].url}/user/data`,
      {method:"POST",body:req.params.data,headers: {
          'Content-Type': 'application/x-www-form-urlencoded'}})
      const data = await response.json();
      console.log(data)
      res.redirect(303,`${json.urls[0][0].url}`+new URLSearchParams(decoded).toString())
      //return res.status(200).json({message:"Successfully confirmed email",emailConfirmed:true});
    }else{
      return res.status(500).json({ message: "User not found" ,errors:[{value:"email",msg:"User not found"}]});
    }
  }catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Invalid data",
      errors: [
        { value: error, msg: error.message },
      ],
    });
  }

})
app.get("/testDB", async (req, res) => {
  const invite = await Invite.findBy([{
    key: "user_id",
    value: req.body.id
  }, {
    key: "invited_email",
    value: req.body.email
  }])
  console.log(invite)
  const testuser = await User.findByID(11)
  //console.log(testuser)
  //const Pavel = await User.findAll({with_related: ['friends']})
  // console.log(Pavel)
  const dsanvite = await Invite.findAll({
    with_related: ['sender', 'receiver']
  })
  //session.run("MATCH (n) return n").then(records=>records.records.forEach(record=>console.log(record.get('n'))))
  res.json({
    invite
  })
})

app.get('/testRelationship', async (req, res) => {
  await create()
  return res.json({})
})


try {
  getUserFromServiceBus()
} catch (e) {
  console.log(e)
}


async function getUserFromServiceBus() {
  try {
    // console.log("Inside getUserFromServiceBus > user: ", user);
    console.log("Inside getUserFromServiceBus > topicName: ", topicName);
    const serviceBusClient = new ServiceBusClient(connectionString);
    const receiver = serviceBusClient.createReceiver(topicName, subscriptionName);

    const myMessageHandler = async (messageReceived) => {
      const message = messageReceived.body
      console.log(`Received message: ${JSON.stringify(message)}`);
      const { user } = message;
      const newUser = new User({ email: user })
      // console.log("User: ", newUser);
      await newUser.save()
      console.log(`User Node was saved`);
      await receiver.completeMessage(messageReceived)
    };

    // function to handle any errors
    const myErrorHandler = async (error) => {
      console.log(`Error occurred with ${error.entityPath} within ${error.fullyQualifiedNamespace}: `, error.error);
      console.log('Error message: ', error.message);
    };

    // subscribe and specify the message and error handlers
    receiver.subscribe({
      processMessage: myMessageHandler,
      processError: myErrorHandler
    });

    // Waiting long enough before closing the sender to send messages
    // await delay(5000);

    // await receiver.close();
    // await serviceBusClient.close();

  } catch (err) {
    console.log("Error occurred: ", err);
    console.log("Error message: ", err.message);
  }
}

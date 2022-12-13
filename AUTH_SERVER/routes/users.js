const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');
const passport = require('passport');
const { generatePassword, checkPassword, issueJWT } = require('../lib/utils');
const { ServiceBusClient } = require("@azure/service-bus");

const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
const topicName = process.env.TOPIC_NAME;

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  return res.status(200).json({ success: true, msg: "You are authorized" })
});

router.post('/login', async function (req, res, next) {
  const { email, password } = req.body
  if (email && password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, msg: "Could not find User" })
      }
      const isPasswordValid = checkPassword(password, user.hash, user.salt);
      if (isPasswordValid) {
        const jwt = issueJWT(user)
        // console.log("jwt: ", jwt);
        return res.status(200).json({ success: true, user: { email: user.email, name: user.name }, token: jwt.token, expiresIn: jwt.expiresIn })
      } else {
        res.status(401).json({ success: false, msg: "Wrong password password" })
      }
    } catch (error) {
      console.log("Error in /login: ", error);
      // next(error)
      return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
  } else {
    return res.status(401).json({ success: false, msg: "Not all credentials where specified" });
  }
});

router.post('/register', async function (req, res, next) {
  // console.log("in register > req.body: ", req.body);
  const { email, name, password } = req.body
  if (email && password && name) {
    const hashAndSalt = generatePassword(password);
    const hash = hashAndSalt.hash;
    const salt = hashAndSalt.salt;
    const findUser = await User.findOne({ email });
    if (findUser) {
      return res.status(401).json({ success: false, msg: "User is already registered" })
    }
    const newUser = new User({ email: email, name: name, hash: hash, salt: salt });
    try {
      await newUser.save()
      // console.log("newUser > user: ", newUser);
      const jwt = issueJWT(newUser)
      const user = { email: newUser.email, name: newUser.name }
      await sendUserToServiceBus(user)
      // console.log("jwt: ", jwt);
      return res.json({ success: true, user, token: jwt.token, expiresIn: jwt.expiresIn })
    } catch (error) {
      console.log(" in /register: ", error);
      console.log("Error message in /register: ", error.message);
      return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
  } else {
    return res.status(401).json({ success: false, msg: "Not all credentials where specified" });
  }
});

module.exports = router;


// const messages = [
// 	{ body: "Albert Einstein" },
// 	{ body: "Werner Heisenberg" },
// 	{ body: "Marie Curie" },
// 	{ body: "Steven Hawking" },
// 	{ body: "Isaac Newton" },
// 	{ body: "Niels Bohr" },
// 	{ body: "Michael Faraday" },
// 	{ body: "Galileo Galilei" },
// 	{ body: "Johannes Kepler" },
// 	{ body: "Nikolaus Kopernikus" }
//  ];

async function sendUserToServiceBus(user) {
  console.log("Inside sendUserToServiceBus > user: ", user);
  console.log("Inside sendUserToServiceBus > topicName: ", topicName);
  // create a Service Bus client using the connection string to the Service Bus namespace
  const sbClient = new ServiceBusClient(connectionString);

  // createSender() can also be used to create a sender for a queue.
  const sender = sbClient.createSender(topicName);

  try {
    const content = { user: user.email, createdAt: user.createdAt }
    await sender.sendMessages({ body: content, contentType: "application/json" });

    console.log(`Sent a message with content ${JSON.stringify(content)} to the topic: ${topicName}`);

    // Close the sender
    await sender.close();
    return true;
  } catch (err) {
    console.log("Error sending user to Service Bus Topic: ", err);
    console.log("Error sending user to Service Bus Topic > error.message: ", err.message);
    return false
  } finally {
    await sbClient.close();
  }
}

// call the main function
// main().catch((err) => {
// 	console.log("Error occurred: ", err);
// 	process.exit(1);
//  }); 
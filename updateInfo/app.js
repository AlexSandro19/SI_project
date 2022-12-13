const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json');
const mongoose = require("mongoose");
const smsHandler = require('./utils/smsHandler');
const PORT = process.env.PORT || 8004,
UserInfo = require('./models/usersInfo');
const { delay, ServiceBusClient } = require("@azure/service-bus");
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
const topicName = process.env.TOPIC_NAME;
const subscriptionName = process.env.SUBSCRIPTION_NAME;
const multer = require('multer');
const streamHandler = require("./utils/streamHandler");
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({
  storage: inMemoryStorage
}).single('file');
app.use(express.json({
  limit: "30mb",
  extended: true
}));
app.use(express.urlencoded({
  limit: "30mb",
  extended: true
}));
require("dotenv").config();
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);


app.post("/updateInfo", uploadStrategy, streamHandler, async (req, res) => {
  try {

    const {
      email,
      name,
      phone
    } = req.body;

    const findUser = await UserInfo.findOne({
      email
    });
    if (!findUser) {
      return res.status(500).json({
        message: "User not found"
      })
    }
    findUser.name = name;
    findUser.picture_path = process.env.AZURE_HTTP_URI + req.blobName;
    smsHandler(findUser.phone)
    findUser.phone = phone;
    await findUser.save();
    const updated_at = new Date().toISOString()

    return res.status(200).json({
      email: findUser.email,
      name: findUser.name,
      picture_path: findUser.picture_path,
      phone: findUser.phone,
      updated_at: updated_at
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error has occurred"
    })
  }

})

app.post("/getInfo", async (req, res) => {
  try {

    const { email } = req.body;
    const findUser = await UserInfo.findOne({ email });
    if (!findUser) {
      return res.status(500).json({
        message: "User not found"
      })
    }
  
    return res.status(200).json({
      email: findUser.email,
      name: findUser.name,
      picture_path: findUser.picture_path,
      phone: findUser.phone
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal Server Error has occurred"
    })
  }

})

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to Mongo");
    app.listen(PORT, () =>
      console.log(`App has been started on port ${PORT}...`)
    );
    getUserFromServiceBus()
  } catch (e) {
    console.log(e)
    process.exit(1);
  }
  mongoose.connection.on('error', err => {
    logError(err);
  });
  // mongoose.connection.on('disconnected', err => {
  //   logError(err);
  // });

}

start();   

async function getUserFromServiceBus() {
  try {
    // console.log("Inside getUserFromServiceBus > user: ", user);
    console.log("Inside getUserFromServiceBus > topicName: ", topicName);
    const serviceBusClient = new ServiceBusClient(connectionString);
    const receiver = serviceBusClient.createReceiver(topicName, subscriptionName);

    const myMessageHandler = async (messageReceived) => {
      const message = messageReceived.body
      console.log(`Received message: ${JSON.stringify(message)}`);
      const {user} = message;
      const newUserInfo = new UserInfo({ email: user });
      await newUserInfo.save()
      console.log(`User Info was saved`);
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

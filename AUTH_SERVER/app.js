const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const mongoose = require("mongoose");
require('./config/passport')(passport);
require('dotenv').config();

const app = express();

app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

const userRouter = require('./routes/users')
app.use(userRouter);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const PORT = 8000;

async function start(){
    try {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("Connected to Mongo");
        app.listen(PORT, () =>
          console.log(`App has been started on port ${PORT}`)
        );
      } catch (e) {
          console.log(e)
        process.exit(1);
      }
      mongoose.connection.on('error', err => {
        logError(err);
      });
      
}

start()
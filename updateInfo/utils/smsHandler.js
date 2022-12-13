require("dotenv").config();

module.exports = (phoneNumber) => {

  try {
    const accountSid = process.env.SMS_SID;
    const authToken = process.env.AUTH_SMS;
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        body: 'Your profile was updated with new information! If it wasnt you who did it please contact us to ',
        from: process.env.SMS_PHONE,
        to: "+" + phoneNumber
      })
      .then(message => console.log(message.sid));
    return {
      message: "Success"
    }
  } catch (e) {
    console.log(e)
    return new Error("An error occurred while updating")
  }
}
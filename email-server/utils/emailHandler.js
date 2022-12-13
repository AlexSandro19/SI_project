const nodemailer = require('nodemailer');
require("dotenv").config();

module.exports = async (receiver_email, inviteLink, user) => {
  console.log(receiver_email);
  console.log(inviteLink);
  try {
    const transporter = nodemailer.createTransport({
      //host: "smtp.mandrillapp.com",
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SEND_GRIT
      }

    })

    const mailOptions = {
      from: 'testovtestov22@gmail.com',
      to: receiver_email,
      //replyTo:email,
      subject: `Email confirmation for ${receiver_email}`,
      text: `You have been invite by your friend ${user.name} to join our website. Click the link below to join us.
                  Link: http://localhost:8080/confirmation/${inviteLink}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return Error("Internal server error");
      } else {

        console.log('Email sent: ' + info.response);
        return {
          message: "Email sent",
          success: true
        };
      }
    });
    return {
      message: "Email sent",
      success: true
    }
  } catch (e) {
    console.log(e);
    return Error("Internal server error");
  }

}
require("dotenv").config();
const nodemailer = require("nodemailer");
const config = require("../config/auth.config");

const user = config.user;
const pass = config.pass;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: pass,
  },
});

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "Please confirm your account",
      // text: "" +"   " +confirmationCode,
      html: `<h3>
  <span  font-family: verdana;">  Thanks for signing up</span> : Please verify your email address by using this code
    </h3>
    <b style="color:blue;">${confirmationCode}</b>`,
    })
    .catch((err) => console.log(err));
};

module.exports.sendConnectus = (name, email, confirmationCode) => {
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "تواصل معانا",
      // text: "" +"   " +confirmationCode,
      html: `<h3>
  <span  font-family: verdana;"> ${name} شكرا لك</span> : تم استلام رسالتك سوف نتواصل معاك في اقرب وقت 
    </h3>
    <b style="color:blue;">عائلة بنون</b>
    
    `,
    })
    .catch((err) => console.log(err));
};

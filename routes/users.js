const express = require("express");
const userRouter = express.Router();
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

const { body, validationResult } = require("express-validator");
const config = require("config");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Appointment = require("../models/appointment");
const connection = require("../connection");

const User = require("../models/users");
const nodemailer = require("../config/nodemailer.config");
//for image
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
///////////////// User Register with username and password
const storage = new GridFsStorage({
  url: "mongodb+srv://omar1234:omar@banoun.lrzmb.mongodb.net/main?retryWrites=true&w=majority",
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });
let gfs;
connection.once("open", () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("uploads");
});




userRouter.get("/:id/appointments", auth, async (req, res) => {
  try {
     const user = await User.findOne({ _id: req.params.id }).populate({path:"schedule", populate : {
      path : 'Specialist'
    }}).exec(
       function(err, user){
         if(err){console.log(err.message); return res.status(500).send("not found")}; 
         return res.status(200).json(user.schedule)
       }
     )

    

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



userRouter.post(
  "/edit",
  [auth],

  async (req, res) => {
    const { firstName, lastName, username, phone, age, city } = req.body;

    console.log(req.body);
    //Build profile object

    const profileFields = {};
    // profileFields._id=req.signedId;

    if (firstName) profileFields.firstName = firstName;
    if (lastName) profileFields.lastName = lastName;
    if (phone) profileFields.phone = phone;
    if (age) profileFields.age = age;
    if (city) profileFields.city = city;
    if (username) profileFields.username = username;

    try {
      let user = await User.findOne({ _id: req.signedId });

      if (user) {
        user = await User.findOneAndUpdate(
          { _id: req.signedId },

          { $set: profileFields },
          { new: true },
          (err, document) => {
            if (!err) {
              console.log(document);
            } else {
              console.log(err);
            }
          }
        );

        return res.json(user);
      }

      res.json("not found the user");
    } catch (err) {
      res.status(500).send(err);
    }
  }
);
//  update image user

userRouter.post("/img/:Id", upload.single("image"), async (req, res) => {
  try {
    let { filename } = req.file;
    console.log(filename);
    let { Id } = req.params;
    let user = await User.findOneAndUpdate(
      { _id: Id },
      { image: req.file },
      { new: true }
    ).exec();
    res.status(200).send({ user });
  } catch (err) {
    res.status(404).send(err.message);
  }
});
userRouter.get("/", auth, async (req, res) => {
  try {
    const user = await await User.findOne({ _id: req.signedId });

    if (!user) {
      return res.status(400).json({ msg: "Not found the user" });
    }

    const arrAppointment = [];
    for (i = 0; i < user.schedule.length; i++) {
      const appointment = await Appointment.findById(user.schedule[i]);
      arrAppointment.push(appointment);
    }
    res.json({ user, arrAppointment });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

userRouter.post(
  "/",
  [
    body("username", "username is required").not().isEmpty(),
    body("firstName", "firstName is required").not().isEmpty(),
    body("lastName", "lastName is required").not().isEmpty(),
    body(
      "password",
      "Please enter a password within 6 or more character"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    //code

    const characters = config.get("Character");
    let confirm = "";
    for (let i = 0; i < 6; i++) {
      confirm += characters[Math.floor(Math.random() * characters.length)];
    }
    // console.log(req.body);
    console.log(confirm);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      // destructing Body => username , password

      const { username, password, firstName, lastName, email } = req.body;

      // get user

      const checkUser = await User.findOne({ username }).exec();

      // check if user already exists!
      console.log(`check user is ${checkUser}`);

      if (checkUser) {
        return res.status(500).json({ error: [`User Already Exists`] });
      }

      //bycrypt password
      let hashPassword = await bycrpt.hash(password, 10);

      // create user in DataBase
      const user = await User.create({
        username,
        firstName,
        lastName,
        email,
        password: hashPassword,
        firstName,
        lastName,
        confirmationCode: confirm,
      });

      console.log(user);
      // create a JWT Token
      const secret = config.get("jwtSecret");

      const token = jwt.sign({ id: user._id }, secret, {
        expiresIn: 360000,
      });

      console.log(token);

      //  res.send({ token });
      res.send({
        message: "User was registered successfully! Please check your email",
      });
      nodemailer.sendConfirmationEmail(
        user.username,
        user.email,
        user.confirmationCode
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: "Server Error" });
    }
  }
);


module.exports = userRouter;

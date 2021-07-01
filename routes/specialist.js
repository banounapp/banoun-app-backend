const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const config = require("config");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Specialist = require("../models/specialist");
const nodemailer = require("../config/nodemailer.config");
const auth = require("../middleware/auth");
//for image
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
// const dbConnection =require('../config/db');
const connection = require("../connection");
const Appointment = require("../models/appointment");

const { equal } = require("assert");
/////////////////////////////////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////////////////////////////////////////
Router.post(
  "/",
  // upload.single('image'),
  upload.array("image", 4),
  // git
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

      const {
        username,
        password,
        email,
        bio,
        gender,
        image,
        phone,
        job,
        city,
        address,
        Specialization,
      } = req.body;

      //console.log(req.body, req.files);

      // get user

      const checkUser = await Specialist.findOne({ username }).exec();

      // check if user already exists!
      console.log(`check user is ${checkUser}`);

      if (checkUser) {
        return res.status(500).json({ error: [`User Already Exists`] });
      }

      //bycrypt password
      let hashPassword = await bycrpt.hash(password, 10);

      console.log(req.files && req.files[0]);
      // create user in DataBase
      const specialist = await Specialist.create({
        username,
        password: hashPassword,
        email,
        bio,
        NationalID: req.files && req.files[1],
        gender,
        phone,
        job,
        confirmationCode: confirm,
        image: req.files && req.files[0],
        certification: req.files && req.files[2],
        city,
        address,
        Specialization,
      });

      // create a JWT Token
      const secret = config.get("jwtSecret");

      const token = jwt.sign({ id: specialist._id }, secret, {
        expiresIn: 360000,
      });

      console.log(token);

      //  res.send({ token });
      res.send({
        message: "User was registered successfully! Please check your email",
      });
      nodemailer.sendConfirmationEmail(
        specialist.username,
        specialist.email,
        specialist.confirmationCode
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: "Server Error" });
    }
  }
);
//////////////////////////////////////////////////////////
Router.get("/", async (req, res) => {
  try {
    const specialist = await Specialist.find({ statusjob: "approval" });

    res.json(specialist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
/////////////////////////////////////////////////////////////////////////////////////
Router.get("/:id", async (req, res) => {
  try {
    const specialist = await Specialist.find({ _id: req.params.id });

    res.json(specialist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//////////////////////////////////////////////////////////////////////////////////////////
Router.post(
  "/login",
  [
    body("username", "username is required").exists(),
    body("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      // destructing Body =>  username , password

      const { username, password } = req.body;

      // get user

      const checkUser = await Specialist.findOne({ username }).exec();

      // check if user already exists!

      if (!checkUser) {
        return res.status(200).json({
          isSuccess: false,
          code: 1,
          error: "Wrong username Or Password",
        });
      }

      const isMatch = bycrpt.compare(password, checkUser.password);

      if (isMatch) {
        // create a JWT Token
        const secret = config.get("jwtSecret");

        const token = jwt.sign({ id: checkUser._id }, secret, {
          expiresIn: 360000,
        });

        if (checkUser.status != "Active") {
          return res.status(200).send({
            isSuccess: false,
            code: 2,
            message: "Pending Account. Please Verify Your Email!",
          });
        }

        if (checkUser.statusjob != "approval") {
          return res.status(200).send({
            isSuccess: false,
            code: 2,
            message:
              "جاري التحقق من المعلومات الشخصية و سيتم الرد في اقرب وقت ",
          });
        }

        res.send({
          code: 0,
          isSuccess: true,
          data: token,
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: "Server Error" });
    }
  }
);
//////////////////////////////////////////////////////////////////////////////////////////

//confirm code

Router.get("/confirm/:confirmationCode", auth, async (req, res) => {
  Specialist.findOne({
    confirmationCode: req.params.confirmationCode,
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      user.status = "Active";
      user.save((err) => {
        if (err) {
          console.log(err);
          res.status(500).send({ message: err });
        }
      });
    })
    .catch((e) => console.log("error", e));
});
////////////////////////////////////////////////////////////////////////////////////////////////
Router.post(
  "/schedule",
  auth,
  [
    body("date", "date is required").exists(),
    body("time", "time is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const { date, time } = req.body;
      // get specialist
      const appointment = await Appointment.create({
        Specialist: req.signedId,
        date,
        time,
      });

      console.log(appointment);
      const specialist = await Specialist.findById(req.signedId);

      // check if user specialist exists!

      if (!specialist) {
        return res.status(200).json({
          isSuccess: false,
          code: 1,
          error: "حدث مشكلة ",
        });
      }

      //   const newappointment={
      //     date,
      //     time
      // }

      specialist.schedule.unshift(appointment._id);
      await specialist.save();
      res.json(specialist);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: "Server Error" });
    }
  }
);

///////////////////////////////////////////////////////////////////////

Router.post(
  "/edit",
  [auth],

  async (req, res) => {
    const { username, price, job, phone, age, city, bio } = req.body;

    //Build profile object

    const profileFields = {};
    // profileFields._id=req.signedId;

    if (username) profileFields.username = username;
    if (bio) profileFields.bio = bio;

    if (price) profileFields.price = price;
    if (phone) profileFields.phone = phone;
    if (age) profileFields.age = age;
    if (city) profileFields.city = city;
    if (job) profileFields.job = job;

    try {
      let user = await Specialist.findOne({ _id: req.signedId });

      if (user) {
        user = await Specialist.findOneAndUpdate(
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
      res.json("not found the Specialist");
    } catch (err) {
      res.status(500).send(err);
    }
  }
);
////////////////////////////////////////////////////////////////////////

Router.get("/", auth, async (req, res) => {
  try {
    const specialist = await Specialist.findOne({ _id: req.signedId });

    if (!specialist || specialist.statusjob !== "approval") {
      return res.status(400).json({ msg: "Not found the specialist" });
    }

    res.json(specialist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//  update image specialist

Router.post("/img/:Id", upload.single("image"), async (req, res) => {
  try {
    let { filename } = req.file;
    console.log(filename);
    let { Id } = req.params;
    let specialist = await Specialist.findOneAndUpdate(
      { _id: Id },
      { image: req.file },
      { new: true }
    ).exec();
    res.status(200).send({ specialist });
  } catch (err) {
    res.status(404).send(err.message);
  }
});

module.exports = Router;

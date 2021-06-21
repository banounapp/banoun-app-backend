const express = require("express");
const userRouter = express.Router();
const auth = require("../middleware/auth");

const { body, validationResult } = require("express-validator");
const config = require("config");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/users");
const nodemailer = require("../config/nodemailer.config");

///////////////// User Register with username and password

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

userRouter.get("/", auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.signedId });

    if (!user) {
      return res.status(400).json({ msg: "Not found the user" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

userRouter.post(
  "/edit",
  [auth],

  async (req, res) => {
    const { firstName, lastName, email, phone, age, city } = req.body;

    console.log(req.body);
    //Build profile object

    const profileFields = {};
    // profileFields._id=req.signedId;

    if (firstName) profileFields.firstName = firstName;
    if (lastName) profileFields.lastName = lastName;
    if (phone) profileFields.phone = phone;
    if (age) profileFields.age = age;
    if (city) profileFields.city = city;
    if (email) profileFields.email = email;

    try {
      let user = await User.findOne({ _id: req.signedId });

      if (user) {
        user = await User.findOneAndUpdate(
          { _id: req.signedId },

          { $set: profileFields },
          { new: true }
        );

        res.json(profileFields);
      }

      res.json("not found the user");
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

module.exports = userRouter;

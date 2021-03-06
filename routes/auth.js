const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/users");
const { body, validationResult } = require("express-validator");
const config = require("config");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Appointment = require("../models/appointment");

// Check Auth
router.get("/", auth, async (req, res) => {
  const id = req.signedId;
  try {
    const user = await User.find({ _id: id }).select("-password").exec();

    if (!user) {
      throw "No such user found";
    }
    const arrAppointment = [];
    for (i = 0; i < user.schedule.length; i++) {
      const appointment = await Appointment.findById(user.schedule[i]);
      arrAppointment.push(appointment);
    }

    res.status(200).json({ arrAppointment });
    //
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login Auth

router.post(
  "/",
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

      if(!username || !password){
        return res.status(400).send("please provide username and password")
      }
      // get user

      const SPECIALIST = await Specialist.findOne({ username:username });

      
      // check if user already exists!
      let USER ;
      let type = "Specialist" 
      if (!SPECIALIST) {
         USER = await User.findOne({ username:username });

        if(!USER){

          return res.status(200).json({
            isSuccess: false,
            code: 1,
            error: "Wrong Username Or Password",
          });
        }
        else{
          type = "User"
        }
      }

      const FoundUser = USER || SPECIALIST;

      const isMatch = bycrpt.compare(password, FoundUser.password);

      if (isMatch) {
        // create a JWT Token
        const secret = config.get("jwtSecret");

        const token = jwt.sign({ id: FoundUser._id }, secret, {
          expiresIn: 360000,
        });

        if (type =="User"? FoundUser.status != "Active" :FoundUser.statusjob != "approval") {
          return res.status(200).send({
            isSuccess: false,
            code: 2,
            message: (type =="User"?"Pending Account. Please Verify Your Email!":"???????? ???????????? ???? ?????????????????? ?????????????? ?? ???????? ???????? ???? ???????? ??????"),
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

//confirm code

router.get("/confirm/:confirmationCode", async (req, res) => {
  User.findOne({
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
      res.send({ message: "???? ?????????? ?????????????? " });
    })
    .catch((e) => console.log("error", e));
});

module.exports = router;

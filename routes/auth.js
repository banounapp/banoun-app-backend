const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/users");
const { body, validationResult } = require("express-validator");
const config = require("config");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Check Auth
router.get("/", auth, async (req, res) => {
  const id = req.sign;
  try {
    const user = await User.findById({ _id: id }).select("-password").exec();

    if (!user) {
      throw "No such user found";
    }
    res.status(200).json({ user });
    //
  } catch (err) {
    res.status(500).json({ errors: `Server Error` });
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

      // get user

      const checkUser = await User.findOne({ username }).exec();

      // check if user already exists!

      if (!checkUser) {
        return res.status(200).json({
          isSuccess: false,
          code: 1,
          error: "Wrong Username Or Password",
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
    })
    .catch((e) => console.log("error", e));
});

module.exports = router;

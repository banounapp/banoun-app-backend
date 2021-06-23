const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");

const Specialist = require("../models/specialist");
const User = require("../models/users");
const auth = require("../middleware/auth");

Router.get("/dataInitialization", auth, async (req, res) => {
  try {
    const specialist = await Specialist.findOne({ _id: req.signedId });


    if (!specialist) {
      const user = await User.findOne({ _id: req.signedId });

      if (!user) {
        return res.status(404).json({ msg: "Not found the user" });
      } else {
        res.json({user:user});
      }
    }
    else{
      res.json({specialist:specialist});

    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


module.exports = Router;

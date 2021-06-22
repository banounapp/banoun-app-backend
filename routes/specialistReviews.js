const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const SpecialistReviews = require("../models/specialistReviews");
const auth = require("../middleware/auth");
const Specialist = require("../models/specialist");

Router.post("/:id", auth, async (req, res) => {
  try {
    const { text, rate } = req.body;

    const specialist = await Specialist.findById(req.params.id);
    if (specialist) {
      const specialistReviews = await SpecialistReviews.create({
        Specialist: req.params.id,
        user: req.signedId,
        text,
        rate,
      });
      await specialistReviews.save();

      res.send({
        message: " شكرا لك  ",
      });
    } else {
      res.send({
        message: "يوجد مشكلة حاول مرة اخري",
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/////////////////////////////////////////////////////////////////////////////
Router.get("/:id", async (req, res) => {
  try {
    const specialistReviews = await SpecialistReviews.find({
      Specialist: req.params.id,
    }).populate("user");

    res.json(specialistReviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = Router;

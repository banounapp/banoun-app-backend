const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const SpecialistReviews = require("../models/specialistReviews");
const auth = require("../middleware/auth");
const Specialist = require("../models/specialist");

Router.post("/:id", auth, async (req, res) => {
  try {
    const { text, rate } = req.body;

    const specialistReviews = await SpecialistReviews.create({
      Specialist: req.params.id,
      user: req.signedId,
      text,
      rate,
    });
    await specialistReviews.save();

    const UpdateSpecialistRate = ({ rate, NofRates }, newRate) => {
      if (NofRates == 0) {
        specialistRate = newRate;
        return specialistRate;
      }

      specialistRate = (rate * NofRates + newRate) / (NofRates + 1);

      return specialistRate;
    };
    const specialist = await Specialist.findOne({ _id: req.params.id });
    specialist.rate = UpdateSpecialistRate(specialist, rate);
    specialist.NofRates = specialist.NofRates + 1;

    await specialist.save();
    res.send({
      newRate: specialist.rate,
      message: " شكرا لك  ",
    });
    //  else {
    //   res.send({
    //     message: "يوجد مشكلة حاول مرة اخري",
    //   });
    // }
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

const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const Appointment = require("../models/appointment");
const auth = require("../middleware/auth");
const Specialist = require("../models/specialist");
const User = require("../models/users");

Router.post("/:id/:appointmentID", auth, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    //find appointment record by id  //then update the record with status reserved   //and add user id to the record
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentID },
      {
        status: "reserved",
        user: req.signedId,
        paymentMethod,
      }
    );

    await appointment.save();

    const user = await User.findById(req.signedId);

    user.schedule.unshift(appointment._id);
    await user.save();

    res.send({
      message: "شكرا لك , سيتم تأكيد الحجز ",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//////////////////////////////////////////////////////////
Router.get("/specialist/:id", async (req, res) => {
  try {
    const specialist = await Specialist.findById(req.params.id);

    const arrAppointment = [];
    for (i = 0; i < specialist.schedule.length; i++) {
      const appointment = await Appointment.findById(specialist.schedule[i]);
      arrAppointment.push(appointment);
    }

    res.json(arrAppointment);

    // const appointment=await Appointment.find({Specialist:req.params.id}).populate("user")
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
///////////////////////////////////////////////////////////////

Router.get("/user/:id", async (req, res) => {
  try {
    // const appointment = await Appointment.find({
    //   user: req.params.id,
    // }).populate("Specialist");

    // res.json(appointment);

    const user = await User.findById(req.params.id);

    const arrAppointment = [];
    for (i = 0; i < user.schedule.length; i++) {
      const appointment = await Appointment.findById(user.schedule[i]);
      arrAppointment.push(appointment);
    }

    res.json(arrAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = Router;

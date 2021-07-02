const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const Appointment = require("../models/appointment");
const auth = require("../middleware/auth");
const Specialist = require("../models/specialist");
const User = require("../models/users");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
/****************user Appointment ***************/
const axios = require("axios");

const jwt = require("jsonwebtoken");

//Use the ApiKey and APISecret from config.js
const payload = {
  iss: process.env.APIKey,
  exp: new Date().getTime() + 5000,
};

const ZOOM_TOKEN = jwt.sign(payload, process.env.APISecret);

Router.patch("/:id", auth, async (req, res) => {
  try {
    //stripe elements way///
    /********stripe code  **********/

    const { attending, _id, paymentId, paymentMethod ,appointmentPrice } = req.body;

    
console.log(req.signedId)
    const updateAppointmentAndUser = async (JOIN_URL ,paymentId) => {
      const appointment = await Appointment.findOneAndUpdate(
        { _id: _id },
        {
          status: "reserved",
          attending: attending,
          paymentMethod: paymentMethod,
          user:req.signedId,
          joinUrl:JOIN_URL&&JOIN_URL,
          paymentId:paymentId && paymentId

        }
      );

      await appointment.save();

      const user = await User.findById(req.signedId);
      user.schedule.unshift(appointment)
      await user.save();
      const specialist = await Specialist.findById(appointment.Specialist);
      const isUserExists =  specialist.clients.includes(req.signedId)
      if(!isUserExists){
        specialist.clients.unshift(req.signedId)

        await specialist.save()  
      }  
      
    };
  

    if (paymentMethod == "online") {
  

      const payment = await stripe.paymentIntents.create({
        amount: appointmentPrice *100,
        currency: "USD",
        payment_method: paymentId,
        confirm: true,
      });

      if (attending == "online") {
        let axios_options = {
          url: `https://api.zoom.us/v2/users/${process.env.ZOOM_EMAIL}/meetings/`,
          method: "post",

          headers: {
            Authorization: `Bearer ${ZOOM_TOKEN}`,
            "User-Agent": "Zoom-api-Jwt-Request",
            "content-type": "application/json",
          },
          options: {
            status: "active",
          },
          json: true,

          data: {
            start_time: "2019-08-30T22:00:00Z",
            duration: 60,
          },
        };
        let JOIN_URL;
        axios(axios_options)
          .then(function (response) {
            return response.data.join_url;
          })
          .then((joinUrl) => {
            console.log("changed");
            
            updateAppointmentAndUser(joinUrl,payment.id)
            return res.status(200).json({
              status: "success",
              joinUrl: JOIN_URL,
              message: "شكرا لك , سيتم تأكيد الحجز ",
            })}).catch((e)=>
            {
              res.status(400).send("error while creating zoom meeting")
          })
        }
          else{
            updateAppointmentAndUser() ; 
            res.status(200).send("payment sucess , please attend in time")
          }
       
    }
    else{
      updateAppointmentAndUser() ; 
      res.status(200).send(" sucess , please attend in time & pay to doctor")
    }
    

    /*********modify appointment ***********/
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
    });
  }
});

/****************get all Appointments for specialist  ***************/
// id => specialist
Router.get("/specialist/:id", async (req, res) => {
  try {
    const specialist = await Specialist.findOne({_id:req.params.id}).populate("schedule").exec(function(err, specialistPopulated){
      if(err) return res.status(500).send("server error")
      return res.json(specialistPopulated.schedule);
    });



  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
///////////////////////////////////////////////////////////////

Router.get("/user/:id", async (req, res) => {
  try {

    const user = await User.findOne({_id:req.params.id}).populate("schedule").exec(function(err, userPopulated){
      if(err) return res.status(500).send("server error")
      return res.json(userPopulated.schedule);
    });;

    res.json(arrAppointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = Router;

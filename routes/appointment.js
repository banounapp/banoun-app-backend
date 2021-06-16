const express = require("express");
const Router = express.Router();
const mongoose = require('mongoose');
const Appointment=require('../models/appointment');
const auth =require('../middleware/auth');
const Specialist = require("../models/specialist");


Router.post('/:id',auth,async(req,res)=>{

    try {
        
        const {date,time,paymentMethod}=req.body;

        const specialist=await Specialist.findById(req.params.id);
        if(specialist){
            const appointment = await Appointment.create({
                specialist:req.params.id,
                user:req.signedId,
                date,
                time,
                paymentMethod

              });
              await appointment.save();

              res.send({
                message: "شكرا لك , سيتم تأكيد الحجز ",
              });
        }
else {
    res.send({
        message: "يوجد مشكلة حاول مرة اخري",
      });
}


    } catch (err) {

        console.error(err.message);
        res.status(500).send('Server Error');
                
    }

})




module.exports=Router;
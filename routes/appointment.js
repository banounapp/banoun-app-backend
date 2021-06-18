const express = require("express");
const Router = express.Router();
const mongoose = require('mongoose');
const Appointment=require('../models/appointment');
const auth =require('../middleware/auth');
const Specialist = require("../models/specialist");


Router.post('/:id/:id_date',auth,async(req,res)=>{

    try {
        
        const {date,time,paymentMethod}=req.body;

        const specialist=await Specialist.findById(req.params.id);
        if(specialist){
            const appointment = await Appointment.create({
                Specialist:req.params.id,
                user:req.signedId,
                date,
                time,
                paymentMethod

              });

              const removeIndex=specialist.schedule.map(item=>item.id).indexOf(req.params.id_date);
    
    
              specialist.schedule.splice(removeIndex,1);
              
              
             
              const newappointment={
                date,
                time,
                status:"reserved"
            }

  specialist.schedule.unshift(newappointment);

  specialist.save();

           
                
                



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








//////////////////////////////////////////////////////////
Router.get('/specialist/:id',async(req,res)=>{

    try {
    
    
        const appointment=await Appointment.find({Specialist:req.params.id}).populate("user")
    
        res.json(appointment);
        
    } catch (err) {
    
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
    
    });
  ///////////////////////////////////////////////////////////////

  Router.get('/user/:id',async(req,res)=>{

    try {
    
    
        const appointment=await Appointment.find({user:req.params.id}).populate("Specialist")
    
        res.json(appointment);
        
    } catch (err) {
    
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
    
    });

module.exports=Router;
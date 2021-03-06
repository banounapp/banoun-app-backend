const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const appointmentSchema = Schema({
 
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    Specialist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Specialist' 
    },
    date:{

        type:Date,
        required: true,        
       },
 paymentMethod :{
    // required: true,
    type: String, 
    enum: ['online', 'cash'],

    },
    time:{
        required: true,
        type: String, 

    },
    status: {
        type: String, 
        enum: ['available', 'reserved'],
        default: 'available'
      },
  
});


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment

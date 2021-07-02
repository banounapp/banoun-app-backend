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
    attending :{
        // required: true,
        type: String, 
        enum: ['online', 'offline'],
    
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
    price:{
          type:Number
      },
      joinUrl:{
          type:String
      } , 
      paymentId:{
          type:String
      }
  
});


const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment

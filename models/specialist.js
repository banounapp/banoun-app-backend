const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const specialistSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  bio:{
    type: String,
    required: true,
  },
  NationalID:{
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  gender: {
    type: String,
    default: null,
  },
  image: {
  },

  statusjob: {
    type: String, 
    enum: ['Pending', 'approval'],
    default: 'Pending'
  },

phone:{
    type: Number, 
    unique: true,
    required: true,

},
job:{
    type: String, 
    required: true,


},
status: {
    type: String, 
    enum: ['Pending', 'Active'],
    default: 'Pending'
  },
  confirmationCode: { 
    type: String, 
    unique: true },

});


const Specialist = mongoose.model('Specialist', specialistSchema);

module.exports = Specialist

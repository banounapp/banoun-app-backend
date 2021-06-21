const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const specialistSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  NationalID: {},
  certification: {},
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
  image: {},

  statusjob: {
    type: String,
    enum: ["Pending", "approval"],
    default: "Pending",
  },

  phone: {
    type: Number,
    unique: true,
    req8uired: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  Specialization: {
    type: String,
    // enum: ['علم نفس', 'معالج نفسي ','معالج نفسي واستشاري أسري'],
  },

  job: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Active"],
    default: "Pending",
  },
  confirmationCode: {
    type: String,
    unique: true,
  },
  price: {
    type: Number,
  },
  schedule: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      // date:{

      // },
      // time:{

      // },
      // status: {
      //   type: String,
      //   enum: ['available', 'reserved'],
      //   default: 'available'
      // },
    },
  ],

  rate: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,

    default: "specialist",
  },
});

const Specialist = mongoose.model("Specialist", specialistSchema);

module.exports = Specialist;

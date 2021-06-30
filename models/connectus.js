const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const connectusSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Connectus = mongoose.model("Connectus ", connectusSchema);

module.exports = Connectus;

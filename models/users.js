const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
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
  picture: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  googleId: {
    type: String,
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

// plugin findorcreate
userSchema.plugin(findOrCreate);

const User = mongoose.model("user", userSchema);

module.exports = User;
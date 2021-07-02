const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const eventSchema = mongoose.Schema({
  Specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Specialist",
  },

  Specialization: {
    type: String,
  },
  Topic: {
    type: String,
  },
  Date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Pending", "accepted", "rejected"],
    default: "Pending",
  },
  description: {
    type: String,
  },
});

// plugin findorcreate
eventSchema.plugin(findOrCreate);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

const express = require("express");
const Router = express.Router();
const Event = require("../models/event");
const auth = require("../middleware/auth");
const Specialist = require("../models/specialist");

/****************Doc event ***************/

Router.post("/", auth, async (req, res) => {
  try {
    const { Specialization, Topic, Date, description } = req.body;
    const specialist = await Specialist.findById(req.signedId);
    if (specialist.eventnumber > 0) {
      const event = await Event.create({
        Specialist: req.signedId,
        Specialization,
        Topic,
        Date,
        description,
      });

      await event.save();
      specialist.eventnumber = specialist.eventnumber - 1;
      specialist.events.unshift(event._id);
      await specialist.save();

      res.send({
        message: "شكرا لك , سيتم تأكيد الحدث ",
      });
    } else {
      res.status(402).json({
        message:
          "نأسف لكم لقد تجاوزت عدد المرات المجانية يرجي الاتصال بالادارة لتجديد مرة اخري شكرا لكم ",
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = Router;

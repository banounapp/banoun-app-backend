const express = require("express");
const Router = express.Router();
const Connectus = require("../models/connectus");
const nodemailer = require("../config/nodemailer.config");

Router.post("/", async (req, res) => {
  try {
    const { name, email, text } = req.body;

    const connectus = await Connectus.create({
      name,
      email,
      text,
    });
    nodemailer.sendConnectus(name, email);
    await connectus.save();

    res.send({
      message: " شكرا لك سوف نتواصل معاك خلال البريد الالكتروني ",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = Router;

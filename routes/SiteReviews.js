const express = require("express");
const Router = express.Router();
const auth = require("../middleware/auth");
const SiteReviews = require("../models/SiteReviews");

Router.post("/", auth, async (req, res) => {
  try {
    const { text, rate } = req.body;

    const siteReviews = await SiteReviews.create({
      user: req.signedId,
      text,
      rate,
    });
    await siteReviews.save();
    const siteReviewsget = await SiteReviews.findById(siteReviews._id).populate(
      "user"
    );
    res.send(siteReviewsget);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

///////////////////////////////
Router.get("/", async (req, res) => {
  try {
    const siteReviews = await SiteReviews.find().populate("user");

    res.json(siteReviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = Router;

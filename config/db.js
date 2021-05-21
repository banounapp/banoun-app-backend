const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const dbConnection = async (req, res) => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log(`Connected to Atlas...`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = dbConnection;

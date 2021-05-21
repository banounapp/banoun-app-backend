const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

//////// Passport serialize/////////////

passport.serializeUser((user, done) => {
  let token = jwt.sign({ id: user.id }, "S3C%M&ET");
  done(null, token);
});

passport.deserializeUser((token, done) => {
  let decode = jwt.verify(token, "S3C%M&ET");
  User.findById(decode.id, function (err, id) {
    done(err, id);
  });
});

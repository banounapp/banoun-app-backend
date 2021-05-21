const passport = require("passport");
const config = require("config");
const GoogleClientID = config.get("Client_Id_Google");
const GoogleClientSecret = config.get("Client_Secret_Google");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/users");

passport.use(
  new GoogleStrategy(
    {
      clientID: GoogleClientID,
      clientSecret: GoogleClientSecret,
      callbackURL: "http://localhost:5000/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      const { name, given_name, family_name, email, picture } = profile._json;

      User.findOrCreate(
        {
          googleId: profile.id,
          username: name,
          picture,
          email,
          firstName: given_name,
          lastName: family_name,
        },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);

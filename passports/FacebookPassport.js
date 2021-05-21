const passport = require("passport");
const config = require("config");
const FacebookClientID = config.get("Client_Id_Facebook");
const FacebookClientSecret = config.get("Client_Secret_Facebook");

const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/users");

passport.use(
  new FacebookStrategy(
    {
      clientID: FacebookClientID,
      clientSecret: FacebookClientSecret,
      callbackURL: "http://localhost:5000/facebook/callback",
      profileFields: ["email", "name"],
    },
    function (accessToken, refreshToken, profile, done) {
      /// get profile data from facebook
      console.log(profile);
      const { last_name, first_name, email, picture } = profile._json;
      User.findOrCreate(
        {
          facebookId: profile.id,
          username: `${first_name} ${last_name}`,
          firstName: first_name,
          lastName: last_name,
          picture,
          email,
        },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);

const express = require("express");
const app = express();

// database
require("./config/db");

// passport congif
const session = require("express-session");
const passport = require("passport");
require("./passports/PassportSerialize");
require("./passports/GooglePassport");
require("./passports/FacebookPassport");

app.set("view engine", "ejs");

////////   session use   /////

app.use(express.json());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);
app.use(passport.initialize());
app.use(passport.session());

////////////////////////////////////// Route to check if works ///////////////
app.get("/", function (req, res) {
  res.render("pages/auth");
});

app.get("/success", (req, res) => res.send(userProfile));
app.get("/error", (req, res) => res.send("error logging in"));

/////////////////////////////////////////// GOOGLE AUTH ////////////////////////////////////

app.get("/failed", (req, res) => res.send("you have failed login"));

app.get("/homepage", (req, res) => {
  res.status(200).json({ token: req.session.passport.user, user: req.user });
});

app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/homepage");
  }
);

///////////////////////////////////////// FaceBook Auth ////////////////////////////////////

app.get("/facebook", passport.authenticate("facebook"));

app.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/failed" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/homepage");
  }
);

// PORT
const PORT = process.env.PORT || 5000;

//routers init
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

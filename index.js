// const express = require("express");

// const app = express();
// const jwt = require("jsonwebtoken");
// const connectDB = require("./config/db");
// const session = require("express-session");
// const passport = require("passport");
// const config = require("config");

// const User = require("./models/users");
// require("./passports/GooglePassport");
// require("./passports/FacebookPassport");




// connectDB();

// app.set("view engine", "ejs");

// //body parsing for body in request
// app.use(express.json());
// app.use(express.static('public'));

// ////////   session use   /////

// app.use(
//   session({
//     resave: false,
//     saveUninitialized: true,
//     secret: "SECRET",
//   })
// );

// // setup passport

// app.use(passport.initialize());
// app.use(passport.session());

// app.get("/", function (req, res) {
//   res.render("pages/auth");
// });

// app.get("/success", (req, res) => res.send(userProfile));
// app.get("/error", (req, res) => res.send("error logging in"));

// //////// Passport serialize/////////////

// passport.serializeUser((user, done) => {
//   let token = jwt.sign({ id: user.id }, "SECRET");
//   done(null, token);
// });

// passport.deserializeUser((token, done) => {
//   let decode = jwt.verify(token, "SECRET");
//   User.findById(decode.id, function (err, id) {
//     done(err, id);
//   });
// });

// /////////////////////////////////////////// GOOGLE AUTH ////////////////////////////////////

// app.get("/failed", (req, res) => res.send("you have failed login"));

// app.get("/homepage", (req, res) => {
//   res.status(200).json({ token: req.session.passport.user, user: req.user });
// });

// app.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/failed" }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("/homepage");
//   }
// );

// ///////////////////////////////////////// FaceBook Auth ////////////////////////////////////

// app.get("/facebook", passport.authenticate("facebook"));

// app.get(
//   "/facebook/callback",
//   passport.authenticate("facebook", { failureRedirect: "/failed" }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.redirect("/homepage");
//   }
// );

// // PORT
// const PORT = process.env.PORT || 5000;

// //routers init
// app.use("/api/users", require("./routes/users"));
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/category", require("./routes/category"));
// app.use("/api/upload", require("./routes/img"));

// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));



const express = require("express");
const app = express();

const dotenv = require("dotenv");
// security with hemlet
const helmet = require("helmet");

// Cors
let cors = require('cors')
 
// database
require("./config/db");

// passport congif
const session = require("express-session");
const passport = require("passport");
require("./passports/PassportSerialize");
require("./passports/GooglePassport");
require("./passports/FacebookPassport");

app.set("view engine", "ejs");
app.set("trust proxy", 1);

let expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

////////   App use   /////
app.use(helmet());
app.use(express.json());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "S3C%M&ET", ////// Unkknown secret
    cookie: {
      // domain: "www.banoun.com",
      // path: "localhost:5000/homepage",
      expires: expiryDate,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors())

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
app.use("/api/category", require("./routes/category"));
app.use("/api/upload", require("./routes/img"));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
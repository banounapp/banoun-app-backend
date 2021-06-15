const express = require("express");
const Router = express.Router();
const mongoose = require('mongoose');
const { body, validationResult } = require("express-validator");
const config = require("config");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Specialist = require("../models/specialist");
const nodemailer = require("../config/nodemailer.config");

//for image 
const crypto = require('crypto');
const path = require('path')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
// const dbConnection =require('../config/db');
const connection =require('../connection');
const { equal } = require("assert");
/////////////////////////////////////////////////////////////////////////////////
const storage = new GridFsStorage({
    url: "mongodb+srv://omar1234:omar@banoun.lrzmb.mongodb.net/main?retryWrites=true&w=majority",
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
})
const upload = multer({ storage });
let gfs;
connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo)
    gfs.collection('uploads')
});
//////////////////////////////////////////////////////////////////////////////////////////

Router.post(
    "/",upload.single('image'),
    [
      body("username", "username is required").not().isEmpty(),
      body( "password","Please enter a password within 6 or more character"
      ).isLength({ min: 6 }),
 ],
    async (req, res) => {
      //code
  
      const characters = config.get("Character");
      let confirm = "";
      for (let i = 0; i < 6; i++) {
        confirm += characters[Math.floor(Math.random() * characters.length)];
      }
      // console.log(req.body);
      console.log(confirm);
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
        });
      }
      try {
        // destructing Body => username , password
  
        const { username, password ,email,bio,NationalID,gender,image,phone,job} = req.body;
  
        // get user
  
        const checkUser = await Specialist.findOne({ username }).exec();
  
        // check if user already exists!
        console.log(`check user is ${checkUser}`);
  
        if (checkUser) {
          return res.status(500).json({ error: [`User Already Exists`] });
        }
  
        //bycrypt password
        let hashPassword = await bycrpt.hash(password, 10);
  
        // create user in DataBase
        const specialist = await Specialist.create({
          username,
          password: hashPassword,
          email,
          bio,
          NationalID,
          gender,
          phone,
          job,
          confirmationCode: confirm,
          image:req.file
        });
  
        // create a JWT Token
        const secret = config.get("jwtSecret");
  
        const token = jwt.sign({ id: specialist._id }, secret, {
          expiresIn: 360000,
        });
  
        console.log(token);
  
        //  res.send({ token });
        res.send({
          message: "User was registered successfully! Please check your email",
        });
        nodemailer.sendConfirmationEmail(
            specialist.username,
            specialist.email,
            specialist.confirmationCode
        );
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ errors: "Server Error" });
      }
    }
  );
  

  module.exports=Router;
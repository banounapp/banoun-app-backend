const express = require("express");
const Router = express.Router();
const mongoose = require('mongoose');

const {check,body ,validationResult } = require('express-validator');
const config = require("config");
const bycrpt = require("bcryptjs");
//Schema
const Category = require("../models/Category");


//for image 
const crypto = require('crypto');
const path = require('path')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
// const dbConnection =require('../config/db');
const connection =require('../connection');
const { equal } = require("assert");
///////////////////////////////////////

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








// get api/all categories

Router.get('/',async(req,res)=>{

    try {
    
    
        const category=await Category.find({})
    
        res.json(category);
        
    } catch (err) {
    
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
    
    
    });
    
  

    
// //get api/all  name & id categories

// Router.get('/',async(req,res)=>{

//     try {
    
    
//         const category=await Category.find({}, { projection: { _id: 1, name: 1 } });
    
//         res.json(category);
        
//     } catch (err) {
    
//         console.error(err.message);
//         res.status(500).send('Server Error');
        
//     }
    
    
//     });
    
  
    
//get api/one category

Router.get('/:category_id',async(req,res)=>{

    try {
    
    
        const category=await Category.findOne({_id:req.params.category_id})
    
        res.json(category);
        
    } catch (err) {
    
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
    
    
    });
    
//get api/one sub-category

Router.get('/:category_id/:subcategory_id',async(req,res)=>{

    try {
    
        const category=await Category.findOne({_id:req.params.category_id});
      
     
        for(i=0;i<category.sub_category.length;i++){

            if(category.sub_category[i]._id==req.params.subcategory_id){
                 category.sub_category[i];
                 res.json(category.sub_category[i]);

            }
        }

         
    
        res.json("Not found");
        
    } catch (err) {
    
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
    
    
    });
    



module.exports=Router;
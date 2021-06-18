const mongoose = require('mongoose');

const express=require('express');
const router =express.Router();
const Post =require('../models/Post');
const connection =require('../connection');
const crypto = require('crypto');
const path = require('path')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const {check ,validationResult } = require('express-validator');
const auth =require('../middleware/auth');


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

/*******************************************************/
router.post('/',upload.single('image'),[auth,[


    check('text',"Text is Required").not().isEmpty()
    
    ]
    ], async(req,res)=>{
    
        const errors=validationResult(req);
    
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array() });
        }
    
    
    try {
    
        // const user=await User.findById(req.signedId).select('-password');
        const newPost= new Post({
            text:req.body.text,
            title:req.body.title,
            Specialist:req.signedId,
            imagepost:req.file
        })
    
        const post=await newPost.save();
    
        res.json(post);
        
    } catch (err) {
    
        console.error(err.message);
    
        res.status(500).send('Server Error');
         
    }
    
        
    }
      );
/*******************************************************/

router.get('/',async(req,res)=>{

    try {
    
    
        const posts=await Post.find().populate('Specialist')
    
        res.json(posts);
        

    } catch (err) {
    

        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
    
    
    });
/*******************************************************/






module.exports=router;


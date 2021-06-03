const express = require("express");
const app = express();
const mongoose = require('mongoose');
const crypto = require('crypto');
const path = require('path')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const category=require('../models/Category');
const Image=require('../models/im');
const dbConnection =require('../config/db');
const routerimg = new express.Router();
const connection=require('../connection');

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

/**********************************************************************/

//To get and show any image
routerimg.get('/show/:filename', (req, res) => {
    console.log(req.params.filename)

    gfs.files.find({ filename: req.params.filename }).toArray((err, file) => {
        console.log(file[0])
        if (!file[0] || file[0].length === 0) {
            return res.status(404).send({ err: 'No file exists' })
        }
        if (file[0].contentType === 'image/jpeg' || file[0].contentType === 'img/png' || file[0].contentType === 'img/jfif') {
            // read output
            const readstream = gfs.createReadStream(file[0].filename);
            readstream.pipe(res)
        } else {
            res.status(404).send({ err: 'No  image' })
        }
    })
})

/**********************************************************************/

//to delete any image by id


routerimg.delete('/delete/:_id', (req, res) => {
    let { _id } = req.params;
    gfs.remove({ _id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).send({ err })
        }
        res.status(200).send({ success: true, message: "Image was deleted successfully" })
    })
})

module.exports=routerimg;
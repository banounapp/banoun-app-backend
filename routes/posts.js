const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const connection = require("../connection");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Specialist = require("../models/specialist");
const User = require("../models/users");

const storage = new GridFsStorage({
  url: "mongodb+srv://omar1234:omar@banoun.lrzmb.mongodb.net/main?retryWrites=true&w=majority",
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });
let gfs;
connection.once("open", () => {
  gfs = Grid(connection.db, mongoose.mongo);
  gfs.collection("uploads");
});

/*******************************************************/
router.post(
  "/",
  upload.single("image"),
  [auth, [check("text", "Text is Required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // const user=await User.findById(req.signedId).select('-password');
      const newPost = new Post({
        text: req.body.text,
        title: req.body.title,
        Specialist: req.signedId,
        imagepost: req.file,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);

      res.status(500).send("Server Error");
    }
  }
);
/*******************************************************/

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("Specialist").sort({ date: -1 });


    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
/*******************************************************/

//get api/posts
//get post by id

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("Specialist");

    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }

    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }

    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*******************************************************/
//delete post by id
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }

    if (post.Specialist.toString() !== req.signedId) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }

    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*******************************************************/
// post api/post/like/:id
//like post

router.post("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been  liked

    if (
      post.likes.filter((like) => like.user.toString() === req.signedId)
        .length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.signedId });

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*******************************************************/
// post api/post/unlike/:id
//like post

router.post("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been  liked

    if (
      post.likes.filter((like) => like.user.toString() === req.signedId)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post  has not been  unliked" });
    }

    //Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.signedId);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

/*******************************************************/

router.post(
  "/comment/:id",
  [auth, [check("text", "Text is Required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.signedId).select("-password");
      const post = await Post.findById(req.params.id);

      if (user) {
        const newComment = {
          text: req.body.text,
          user: req.signedId,
          Specialist: post._id,
        };
        post.comments.unshift(newComment);
        await post.save();
      } else if (await Specialist.findById(req.signedId).select("-password")) {
        const newComment = {
          text: req.body.text,
          Specialist: req.signedId,
          user: post._id,
        };
        post.comments.unshift(newComment);
        await post.save();
      } else {
        res.json("not found the user");
      }

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);

      res.status(500).send("Server Error");
    }
  }
);

/*******************************************************/
//post api/posts/comment/:id/:comment_id
//delete comment
// private

router.delete("/comment/:post_id/:comment_id", auth, async (req, res) => {
  try {
    // const user=await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.post_id);

    //

    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    if (!comment) {
      return res.status(404).json({ msg: "comment is not exist" });
    }

    if (comment.user.toString() == req.signedId) {
      const removeIndex = post.comments
        .map((comment) => comment.user.toString())
        .indexOf(req.signedId);

      post.comments.splice(removeIndex, 1);

      await post.save();
      res.json(post.comments);
    } else if (
      comment.Specialist &&
      comment.Specialist.toString() == req.signedId
    ) {
      const removeIndex = post.comments
        .map((comment) => comment.Specialist.toString())
        .indexOf(req.signedId);

      post.comments.splice(removeIndex, 1);

      await post.save();
      res.json(post.comments);
    } else {
      return res.status(401).json({ msg: "user not authorized" });
    }
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

/*******************************************************/

/*******************************************************/

module.exports = router;

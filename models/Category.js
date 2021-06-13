const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    // required:true
  },
  description: {
    type: String,
    // required:true
  },
  image: {},
  sub_category: [
    {
      name: {
        type: String,

        // required: true
      },
      description:{
        type: String,


      },
      image: {},


      articles: [
        {
          title: {
            type: String,
            // required:true
          },
          description: {
            type: String,
            // required:true
          },
          image: {},
        },
      ],

      books: [
        {
          title: {
            type: String,
            //  required:true
          },
          description: {
            type: String,
            // required:true
          },
          image: {},
          link: {
            type: String,
            // required:true
          },
        },
      ],
    },
  ],
});

module.exports = Category = mongoose.model("category", categorySchema);

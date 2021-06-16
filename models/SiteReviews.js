const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const siteReviewsSchema = Schema({
 
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
  
    text:{
        type:String,
        required:true

    },
    date:{
        type:Date,
        default:Date.now
    },
    rate:{
type : Number,
default:5
    }
});


const SiteReviews = mongoose.model('SiteReviews', siteReviewsSchema);

module.exports = SiteReviews

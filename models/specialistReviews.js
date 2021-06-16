const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const specialistReviewsSchema = Schema({
 
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    specialist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'specialist' 
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


const SpecialistReviews = mongoose.model('SpecialistReviews', specialistReviewsSchema);

module.exports = SpecialistReviews

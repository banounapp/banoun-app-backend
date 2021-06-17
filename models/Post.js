const mongoose =require('mongoose');

const PostSchema=new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
text:{
    type:String,
},

title:{
    type:String
},

likes:[
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'users'
        },

       
    }
],

comments:[

    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'users'
        },  
       
        text:{
            type:String,
            required:true
    
        },
       
        date:{
            type:Date,
            default:Date.now
        },
      
    }

],
date:{
    type:Date,
    default:Date.now
}
, 
  upload:{
    


},

image:{

},
imagepost:{

}
});



module.exports=Post=mongoose.model('post',PostSchema);
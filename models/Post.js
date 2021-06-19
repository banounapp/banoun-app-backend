const mongoose =require('mongoose');

const PostSchema=new mongoose.Schema({
    Specialist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Specialist' 
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
            ref:'user'
        },
        Specialist:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Specialist' 
        },

       
    }
],

comments:[

    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },  
        Specialist:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Specialist' 
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
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://omar1234:omar@banoun.lrzmb.mongodb.net/main?retryWrites=true&w=majority", {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify:false,
    useCreateIndex:true,
    
});
const connection = mongoose.connection;

module.exports = connection;



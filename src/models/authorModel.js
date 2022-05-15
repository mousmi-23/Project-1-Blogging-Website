const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    fname : {
        type : String,   
        trim : true,
        required : true 
    },
    lname : {
        type : String,
        trim : true,
        required : true
    },
    title : {
        type : String,
        enum : ["Mr", "Mrs", "Miss"],
        required : true
    },
    email : {
        type : String,
        unique: true,
        required : true,
        match : [/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/, 'Please fill a valid email address']
    },
    password : {
        type : String,
        required : true
    }
}, { timestamps: true });

module.exports = mongoose.model('Author41', authorSchema);
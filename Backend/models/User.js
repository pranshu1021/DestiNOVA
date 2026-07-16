const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String, 
        required: true,
        unique: true, 
        lowercase: true,
        trim: true, 

    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
},
    {
        timestamps: true // yeh time add kardeta hai jab new user add ho
    }
);
module.exports = mongoose.model("User", userSchema);

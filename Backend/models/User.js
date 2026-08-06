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
        default:"",
    },
    password: {
        type: String,
        default:"",
    },
    provider:{
        type: String,
        enum: ["local","google"],
        default: "local",
    },
    googleId:{
        type: String,
        default:"",
    },
    photo:{
        type: String,
        default:"",
    },
    // ASTROLOGY PROFILE KE data
    gender:{
        type: String,
        enum:["Male","Female","Other",""],
        default:"",
    },

    dateOfBirth: {
    type: String,
    default: "",
}
    ,
    birthTime:{
        type:String,
        default:"",

    }
    ,birthPlace:{
        type: String,
        default:"",
    },
    birthLatitude:{
        type: Number,
        default: null,
    },
    birthLongitude: {
        type: Number,
        default:null,
    },
    profileCompleted:{
        type: Boolean,
        default: false,
    },
    notificationSettings: {
        dailyHoroscope: { type: Boolean, default: true },
        muhuratReminders: { type: Boolean, default: true },
        festivalReminders: { type: Boolean, default: true },
        pushToken: { type: String, default: "" },
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    premiumExpiresAt: {
        type: Date,
        default: null,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    }

},
    {
        timestamps: true // yeh time add kardeta hai jab new user add ho
    }
);
module.exports = mongoose.model("User", userSchema);

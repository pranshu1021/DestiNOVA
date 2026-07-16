const express = require("express");   //express helps us create the backend server
const authRoutes = require("./routes/auth");
const cors = require("cors"); // cors allows requests from our frontend 

require("dotenv").config(); // load kar rhe hai variables from .env file

const connectDB= require("./config/db"); // iimport kar rhe hai database connection function ko

connectDB();

const PORT = process.env.PORT || 5000;
const app = express();

//MIDDLEWARE

app.use(cors());   // allow karega frontend ko backend access krne mei
app.use("/api/auth",authRoutes);
app.use(express.json()); //allow karega express ko to understand JSON data
app.use(express.urlencoded({extended:true}))

app.get("/", (req,res)=>{
    res.json({
        success: true, 
        message:"hello mehak aur pradeep (backend here)"
    })
})
//template litral
app.listen(PORT,()=>{
    console.log(`humara server port ${PORT}`);
})
const User = require("../models/User"); //import user model

const bcrypt = require("bcryptjs")// import bcrypt
const jwt=require("jsonwebtoken")


const signup = async(req,res) =>{
    try{
        const { fullName, email, phone, password} = req.body;

        if(!fullName || !email || !phone || !password){
            return res.status(400).json({
                success:false,
                message: "Please fill your data correctly"
            });
        }

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = new User({
            fullName,
            email,
            phone,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            success:true,
            message:"Account created successfully."
        });
        
    }

    catch (error){
        console.log(error);

        res.status(400).json({
            success:false,
            message:"Internal Server Error"
        })
    }
};

const login=async(req,res)=>{
    const token=jwt.sign(
        {
            id:user._id
        },
        process.env.JWT_SECRET,
        {expiresIn:"7d"}
    )
    try{
        const {email,password}=req.body;
        // validation 

        if(!email || !password){
            return res.status(400).json(
                {
                    success:false,
                    message:"Please fill all fields"
                }
            )
        }
    const user= await User.findOne({email});
    if(!user){
        return res.status(404).json(
            {
                success:false,
                message:"User doesn't exist"
            }
        )
    } 
      const isMatch=await bcrypt.compare(password,user.password);// comparing the password   

      if(!isMatch){
        return res.status(401).json({
           success:false,
           message: "Incorrect email/password", 
        })
      }
     const user= await User.findOne({email});
      res.status(200).json({
        sucess:true,
        message:"Login Successfully",
        token,
        user:{
            id:user._id,
            fullName:user.fullName,
            email:user.email,
            phone:user.phone,

        }
      })
    }
catch(error){
    console.log(error);
    res.status(500).json({
        sucess:false,
        message:"Internal server error"
    })
}
}

module.exports = {
    signup,login
};
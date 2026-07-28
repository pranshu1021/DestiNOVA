const User = require("../models/User");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken"); 
const {OAuth2Client} = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID)


const signup = async (req, res) => {
    try {

     
        const { fullName, email, phone, password } = req.body;

      
        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

     
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered."
            });
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email,
            phone,
            password: hashedPassword
        });

     
        await user.save();

        return res.status(201).json({
            success: true,
            message: "Account created successfully."
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};


const login = async (req, res) => {

    try {


        const { email, password } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });

        }


        const user = await User.findOne({ email });


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User doesn't exist."
            });

        }


        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

        return res.status(401).json({
                success: false,
                message: "Incorrect email or password."
            });

        }

        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }

        );

        return res.status(200).json({

            success: true,
            message: "Login Successful.",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone
            }

        });

    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const googleLogin = async(req,res) =>{

    try{
        console.log("Google route hit");
    console.log(req.body);
            const {idToken} = req.body; // frontend se google id token receive karenge

            if(!idToken){
                return res.status(400).json({
                    success:false,
                    message:"Google ID Token is required."
                });
            }
            //verifyIdToken
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_WEB_CLIENT_ID,
            })
              // to get user data google se =>>   getPayload 
            const payload = ticket.getPayload()
            // Google user ID
            const  { sub, name, email, picture} = payload
            let user  = await User.findOne({email}); //  already user hai toh usko save krdo user ke andar


            //nnahi hai toh naya user create kar rhe hai
            if(!user){
                user = new User({
                    fullName:name,
                    email,
                    phone:"",
                    password:"",
                    provider:"google",
                    googleId: sub,
                    photo: picture
                });
                await user.save();
            }

                // jwt token create 

                // token kiske liye bna rhe hai, sercret, expiry date
                const token = jwt.sign(
                    {
                        id: user._id
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn:"7d"
                    }
                );

                return res.status(200).json({
                    success:true,
                    message: "Google Login Successful.",
                    token,
                    user:{
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        phone: user.phone,
                        photo: user.photo
                    }
                })


    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Google Login Failed."
        })
    }
}

const getProfile = async(req, res)=>{
    try{
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json({
            success:true,
            user
        })
    }
    catch(error){
        res.status(500).json({
            success:false,
        message:"Server Error"
        })
    }
}


const updateProfile = async(req, res)=>{
    try{
        const userId = req.user.id;
        const{
            fullName,
            gender,
            birthTime,
            birthPlace,
            birthLatitude,
            birthLongitude,
            profileCompleted
        } = req.body

        const updateFields = {};
        if(fullName !==undefined) updateFields.fullName = fullName;
        if(gender !==undefined) updateFields.gender = gender;
        if(birthTime !==undefined) updateFields.birthTime = birthTime;
        if(birthPlace !==undefined) updateFields.birthPlace = birthPlace;
        if(birthLatitude !==undefined) updateFields.birthLatitude = birthLatitude;
        if(birthLongitude !==undefined) updateFields.birthLongitude = birthLongitude;
        if(profileCompleted !==undefined) updateFields.profileCompleted = profileCompleted;

// name.length <3
        // Pranshu --> Pranshu Gupta -->> pr
        const updatedUser= await User.findByIdAndUpdate(
            userId,
            {$set: updateFields},
            {new:true, runValidators:true}
        ).select("-password");

        if(!updatedUser){
            return  res.status(404).json({
            success:false,
            message:"User Not Found"
        })
         
    }
    return  res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            user: updatedUser
        })

}
catch(error){
    console.log("UpdateProfile error:" , error);
    return res.status(500).json({
        success:false,
        message: "Internal Server Error"
    })
}
}
module.exports = {

    signup,
   googleLogin,
    login,
    getProfile
    , updateProfile
}
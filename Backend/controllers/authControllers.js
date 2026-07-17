const User = require("../models/User");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken"); 


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

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};


module.exports = {

    signup,

    login

};
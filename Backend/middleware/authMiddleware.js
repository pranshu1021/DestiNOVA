const jwt=require('jsonwebtoken');


const protect=(req,res,next)=>{
try{
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({
            success:false,
            message:"No token provided"
        });
    }
}
}
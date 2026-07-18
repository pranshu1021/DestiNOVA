const jwt=require('jsonwebtoken');


const protect=(req,res,next)=>{
try{
    const authHeader=req.headers.authorization;  // Getting authorization header
    
    
    if(!authHeader){ //check kar rhe hai if token exists
        return res.status(401).json({
            success:false,
            message:"No token provided"
        });
    }
// Header format
// Bearer eyejVBADHVCSHbASHCASBDA
// [Bearer, eyejVBADHVCSHbASHCASBDA]
    const token=authHeader.split(" ")[1];

    //verify token
    const decoded=jwt.verify(token,process.env.JWT_SECRET) // (secret env file se aati h)
    req.user=decoded; //save user data inside request 
    next();
}
catch(error){
    return res.status(401).json({
        success:false,
        message:"Expired/invalid Token."
    })
}
}
module.exports=protect;
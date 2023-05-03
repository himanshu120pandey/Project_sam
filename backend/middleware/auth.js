const jwt=require("jsonwebtoken");
const User=require("../model/userModel");


exports.isAuthentcatedUser=async(req,res,next)=>{

    const  {token}=req.cookies;
    // console.log(token);
    if(!token)
    {
            res.status(401).json({
                message:"Please Login to access this resource"
            })
            // return next( new ErrorHandler("Please Login to access this resource",401));
    }
    else
    {
        const decodedata=jwt.verify(token,process.env.JWT_SECRET);
        // console.log(decodedata.id);
        req.user = await User.findById(decodedata.id);
        next(); 
    }
};
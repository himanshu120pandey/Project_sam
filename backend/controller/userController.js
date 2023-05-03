const User=require("../model/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail");
const crypto=require("crypto");
const jwt=require('jsonwebtoken');


let otp='';
function generateOTP() {
    const digits = '0123456789';
    let otp1='';
    for (let i = 0; i < 6; i++) {
      otp1 += digits[Math.floor(Math.random() * 10)];
    }
  
    return otp1;
  }

exports.register=async(req,res,next)=>{

    try{
        const {email,password,name,avatar}=req.body;
        const user = await User.findOne({"email":email}).exec();
        if(!user)
        {
            const otp1=generateOTP();
            otp=otp1;
            const OTPUrl1=jwt.sign({otp2:otp1},process.env.JWT_SECRET,{expiresIn:'1h'});
            const OTPUrl=`${req.protocol}://${req.get("host")}/api/v1/otp?token=${OTPUrl1}`;
            const message=`Your One Time Password is  :- \n\n ${otp} \n
            ${OTPUrl}
            \n\n
            If you have not requested this email then ,please ignore it`;

            await sendEmail({
                email:email,
                subject:`Login OTP`,
                message
            });
            const options={
                expires:new Date(
                    Date.now() + process.env.COOKIE_EXPIRE * 24*60*60*1000
                ),
                httpOnly:true,
            };
            res.cookie('name',name,options);
            res.cookie('email',email,options);
            res.cookie('password',password,options);
            res.cookie('avatar',avatar,options);
            res.status(200).json({
                success:true,
                message:`OTP sent to ${email} successfully`,
            })
            
           
        }
        else
        {
            res.status(404).json({
                message:"User Found",
            })
        }
    }
    catch(error)
    {
        console.log(error);
    }
}

async function createuser(req,res)
{
    const name=req.cookies.name;
    const avatar=req.cookies.avatar;
    const password=req.cookies.password;
    const email=req.cookies.email;
    res.clearCookie('name');
     res.clearCookie('email');
    res.clearCookie('password');
    res.clearCookie('avatar');
        const user1=await User.create({
                name,password,email,avatar
        });
        sendToken(user1,201,res); 
}

exports.otp=async(req,res,next)=>{
    try{
        const otpver=req.query.token;
        jwt.verify(otpver,process.env.JWT_SECRET,(err,decoded)=>{
            if(err)
            {
                res.status(401).send('Unauthorized');
            }
            else
            {
                const userotp=req.body.otp;
                if(userotp==decoded.otp2)
                {
                    createuser(req,res);
                }
                else
                {
                    res.status(400).json({
                        message:"OTP Incorrect",
                    })
                }
            }

        })
       
    }
    catch(err)
    {
        console.log(err);
    }
}

exports.login=async(req,res,next)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password)
        {
            res.status(400).json({
                message:"Enter correct Email or Password",
            })
        }
        else
        {
                const user = await User.findOne({"email":email}).select("+password");
                if(!user)
                {
                    res.status(404).json({
                        message:"User Not Found",
                    })
                }
                else
                {
                const isPasswordMatched=await user.comparePassword(password)
                if(isPasswordMatched)
                {
                    sendToken(user,200,res);
                }
                else
                {
                    res.status(401).json({
                        message:"Enter correct Email or Password",
                    })
                }
                    
                }
        }
       

    }
    catch(e)
    {
        console.log(e);
    }
}


//logout a user
exports.logout =async(req,res,next)=>
{

    try{
        res.cookie("token",null,{
            expires: new Date(Date.now()),
            httpOnly:true,
        });
        res.status(200).json({
            success:true,   
            message:"Logged Out",
        });
    }

   
    catch(e)
    {
        console.log(e);
    }
};



//Get user Details
exports.getUserDetails=async(req,res,next)=>
{
    const user =await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    });

};


//Forgot Password
exports.forgotPassword =async(req,res,next)=>{

    const user=await User.findOne({email:req.body.email});

    if(!user)
    {
        res.status(404).json({
            message:"User not found",
        })
        // return next(new ErrorHandler("User not found",404));   
    }
    else
    {

    
    //Get resetPassword token
    const resetToken    = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});

    const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    // const resetPasswordUrl=`${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    // const resetPasswordUrl=`${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    const message=`Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf ypu have not requested this email then ,please ignore it`
    try
    {
            await sendEmail({
                email:user.email,
                subject:`Password Recovery`,
                message
            });
            res.status(200).json({
                success:true,
                message:`Email send to ${user.email} successfully`,
            })
    }

    catch(err)
    {
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false});
        res.status(500).json({
            message:err.message,
        })
        // return next(new ErrorHandler(err.message,500));
    }   
}
};



//RESET PASSWORD
exports.resetPassword=async (req,res,next)=>{

    //Creating token hash
    const resetPasswordToken=crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    });

    if(!user)
    {
        res.status(404).json({
            message:"Reset Password token is invalid or has been expired",
        })
        // return next(new ErrorHandler("Reset Password token is invalid or has been expired",404));   
    }
    else
    {

        if(req.body.password!=req.body.confirmPassword)
        {
            res.status(400).json({
                message:"Password not match",
            })
            // return next(new ErrorHandler("Password not match",400));
        }
        else
        {
            user.password=req.body.password;
            user.resetPasswordToken=undefined;
            user.resetPasswordExpire=undefined;

            await user.save();
            sendToken(user,200,res);
        }
}

};

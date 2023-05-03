const mongoose =require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter your Name"],
        maxlength:[30,"Name cannot exceed 30 characters"],
        minlength:[4,"Name should have more than 4 charaters"]
    },
    email:{
        type:String,
        required:[true,"Please Enter your Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"],
    },
    password:{
        type:String,
        required:[true,"Please Enter your Password"],
        minlength:[8,"Password should have more than 8 charaters"],
        select:false,
    },
    avatar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
friends:{
    type: Array,
    default: []
},
location: String,
occuption: String,
viewedProfile: Number,
impressions: Number,

    resetPasswordToken:String,
    resetPasswordExpire:Date,   
});

userSchema.pre("save",async function(next)
{
    if(!this.isModified('password'))
    {
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
}); 

userSchema.methods.getJWTToken =function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

//Comparing Password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);

};

//Generating Password Reset Token
userSchema.methods.getResetPasswordToken =function () {
    //Generating Token
    const resetToken=crypto.randomBytes(20).toString("hex");
    //Hashing and adding to user schema
    this.resetPasswordToken=crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
//Expire in 15 minutes
    this.resetPasswordExpire=Date.now() + 15*60*1000;
    return resetToken;
};


module.exports=mongoose.model("User",userSchema);
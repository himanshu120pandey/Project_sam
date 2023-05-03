const mongoose=require("mongoose");


// wvBFAuKO0UqHr0yy

// 62TrsNWr44cgeC7A

// 4n7JTESiOjajYOYc


// Mac@54321
const connectDataBase=()=>{
    mongoose.connect("mongodb+srv://abc:0VG2dkp7t51dYVRx@cluster0.bfmsdrc.mongodb.net/test",{useNewUrlParser:true}).then((data)=>{
        console.log(`Mongodb connected to server :${data.connection.host}`);
    }).catch((err)=>{
        console.log(err);
    })
};
module.exports=connectDataBase;
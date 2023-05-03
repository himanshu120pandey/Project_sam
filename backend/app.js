const express=require("express");
const app=express();
const bodyParser=require("body-parser");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const user=require("./routes/userRoute");


const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, 'config/config.env') })


app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({limit:'50mb',parameterLimit:10000000,extended:true}));

app.use("/api/v1",user);
// app.use("/api/v1",post);

module.exports=app;

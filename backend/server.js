const app=require("./app");
const connectDataBase=require("./config/database");


const path = require('path');
const dotenv = require('dotenv');


process.on("uncaught Exception",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    process.exit(1);
});

dotenv.config({ path: path.resolve(__dirname, 'config/config.env') })
 PORT=3000;

 connectDataBase();

 

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})

 
//Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
    // console.log('Error: ${err.message}`);
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    server.close(()=>{
        process.exit(1);
    });
});
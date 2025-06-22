import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/db/index.js";
import { app } from "./app.js";





console.log("🔍 Loaded MONGODB_URI:", process.env.MONGODB_URI);


connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running on port ${process.env.PORT}`);
        
    })
})
.catch((error)=>{
    console.log("mongodb connnection failed!!!",error);
    
})




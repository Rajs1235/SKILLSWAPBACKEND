import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/index.js";
import { server } from "./app.js";




console.log("🔍 Loaded MONGODB_URI:", process.env.MONGODB_URI);


connectDB()
.then(()=>{
    server.listen(process.env.PORT||3000,()=>{
        console.log(`server is running on port ${process.env.PORT||8000}`);
        
    })
})
.catch((error)=>{
    console.log("mongodb connnection failed!!!",error);
    
})




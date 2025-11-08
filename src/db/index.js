import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI is missing in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${MONGO_URI}/${DB_NAME}`, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB connected");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};



// const connectDB = async () => {
//     try {
//         if(!process.env.MONGODB_URI)
//         {
//             console.log('MONGOD_URI  is missing in .env file');

            
//         }
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log(DB_NAME);
        
//         // console.log(`\n Mongoose connected || DB HOST: ${connectionInstance.connection.host}`);

        
//     } catch (error) {
//         console.log("MONGODB connection FAILED",error);
//         process.exit(1);
        
//     }
// }

export default connectDB;
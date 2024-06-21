import mongoose from "mongoose";

export default async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || "");
      console.log("Connected to database");
    }
  } catch (error) {
    console.error("Error connecting to database", error);
  }
}

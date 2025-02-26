import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      "mongodb+srv://satyachiratla:satya6897@cluster0.gzwoi.mongodb.net/peddadameals?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log(
      ` \n MongoDB connected ! DB host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB connection error ", error);
    process.exit();
  }
};

export default connectDB;

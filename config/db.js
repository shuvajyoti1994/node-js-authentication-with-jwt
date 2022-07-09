import mongoose from "mongoose";

const connectDb = async (DATABASE_URL)=>{
    try{
        const DB_OPTION={
            dbName:"myshop"
        }
        await mongoose.connect(DATABASE_URL,DB_OPTION)
        console.log('connected mongo successfully...');
    }catch(error){
        console.log(error);
    }
}

export default connectDb;
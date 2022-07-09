import dotenv from 'dotenv';
dotenv.config()

import express from 'express';
import  connectDb from './config/db.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT
const DATABASE_URL= process.env.DATABASE_URL

//Database connection
connectDb(DATABASE_URL)

//JSON
app.use(express.json())

//Load Routes
app.use('/api/user',userRoutes)


app.listen(port,()=>{
    console.log(`Server listening at http://localhost:${port}`);
})


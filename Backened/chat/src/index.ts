import express from 'express'
import chatRoutes from './routes/chat.js'
import connectDB from './config/db.js'
import cors from 'cors'

import dotenv from 'dotenv'
dotenv.config()

connectDB();

const app = express()

app.use(express.json());
app.use(cors());

app.use("/api/v1",chatRoutes);

app.listen(process.env.PORT, ()=>{
    console.log(`Chat services is Running on ${process.env.PORT}`)
})
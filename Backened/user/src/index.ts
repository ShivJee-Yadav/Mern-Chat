import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import { createClient } from 'redis'
import userRoutes from './routes/user.js'
import {connectRABBITMQ} from './config/rabbitmq.js'
dotenv.config()

const app = express()
const port = process.env.PORT;

connectDB();
connectRABBITMQ();

export const redisClient = createClient({
    url: process.env.REDIS_URL!,
});

redisClient.connect().then(()=>{
    console.log("Connected to reddiss")
}).catch(console.error)

app.use("api/v1",userRoutes)

app.listen(port, ()=>{
    console.log(`Server is Running on Port ${port}`)
})
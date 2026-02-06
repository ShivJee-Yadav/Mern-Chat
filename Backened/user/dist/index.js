import express from 'express';
import connectDB from './config/db.js';
import { createClient } from 'redis';
import userRoutes from './routes/user.js';
import { connectRABBITMQ } from './config/rabbitmq.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = Number(process.env.PORT);
connectDB();
connectRABBITMQ();
export const redisClient = createClient({
    url: process.env.REDIS_URL,
});
redisClient.connect().then(() => {
    console.log("Connected to redis");
}).catch(console.error);
app.use(express.json());
app.use("/api/v1", userRoutes);
app.listen(port, () => {
    console.log(`Server is Running on Port ${port}`);
});
//# sourceMappingURL=index.js.map
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";

//  Rabit MQ or kafka 
export const loginUser = TryCatch(async(req,res)=>{
    const {email} = req.body
    const rateLimitKey = `otp:ratelimit:${email}`
    const rateLimit = await redisClient.get(rateLimitKey)
    if(rateLimit)
    {
        res.status(429).json({
            message: "Too Many request. Please Wait before Requesting new OPT",
        });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const otpkey = `opt:${email}`
    await redisClient.set(otpkey,otp,{
        EX:300,
    });
    await redisClient.set(rateLimitKey,"true",{
        EX:60,
    });
    const message = {
        to: email,
        subject:"your OTP code",
        body:`Your OTP is ${otp}. It is valid for 5 Minutes`,
    };
    await publishToQueue("send-otp",message)

    res.status(200).json({
        message:"OTP sent yo your mail"
    })

})
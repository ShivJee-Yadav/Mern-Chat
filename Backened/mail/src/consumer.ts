import amqp from 'amqplib';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const startSendOtpConsumer = async() => {
    try{
        const connect = await amqp.connect({
             protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5001,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });


        const channel = await connect.createChannel()
        const queueName = 'send-otp'

        await channel.assertQueue(queueName, {durable:true});

        console.log("Mail service Consumer started, Listening for opt emails")
        channel.consume(queueName , async(msg) =>{
            if(msg)
            {
                try{
                    const {to,subject , body} = JSON.parse(msg.content.toString())
                    const transporter = nodemailer.createTransport({
                        host:"smtp.gmail.com",
                        port:465,
                        auth:{
                            user:process.env.USER,
                            pass:process.env.PASSWORD
                        },
                });
                await transporter.sendMail({
                    from:"Chat App",
                    to,
                    subject,
                    text:body,
                });
                console.log(`OTP send mail Send to ${to}`);
                channel.ack(msg);
            }catch(error){
                    console.error(`Failed to Send OTP ${error}`);
            }        
        }
  });
}catch(error){
        console.error(`Failed to start because of Error ${error}`)
    }
}
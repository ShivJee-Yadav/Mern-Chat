import amqplib from 'amqplib';
let channel;
export const connectRABBITMQ = async () => {
    try {
        const connection = await amqplib.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });
        channel = await connection.createChannel();
        console.log("Connected to RabbitMQ successfully");
    }
    catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
    }
};
export const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.log("RabbitMQ channel is not established");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};
//# sourceMappingURL=rabbitmq.js.map
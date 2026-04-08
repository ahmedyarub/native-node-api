import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
        channel = await connection.createChannel();
        await channel.assertQueue('user_created', { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('RabbitMQ Connection Error', error);
    }
};

export const publishUserCreatedEvent = (userId: number, email: string) => {
    if (!channel) return;
    const msg = JSON.stringify({ userId, email, timestamp: new Date() });
    channel.sendToQueue('user_created', Buffer.from(msg));
};

import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function startWorker() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'user_created';

        await channel.assertQueue(queue, { durable: true });

        console.log(`[*] Notifications Service: Waiting for messages in ${queue}.`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                console.log(`[x] Received notification request for user ${data.userId} (${data.email}) at ${data.timestamp}`);

                // Simulate sending an email/notification
                setTimeout(() => {
                    console.log(`[x] Notification sent successfully to ${data.email}`);
                    channel.ack(msg); // Acknowledge message processing
                }, 1000);
            }
        });
    } catch (error) {
        console.error('Failed to start Notification Worker:', error);
        setTimeout(startWorker, 5000); // Retry on failure
    }
}

startWorker();

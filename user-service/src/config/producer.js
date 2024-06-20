const initRabbitMQ = require('./rabbitmq');

async function sendToQueue(queue, message) {
    const { channel } = await initRabbitMQ();

    channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true
    });

    console.log(`Message sent to queue ${queue}: ${message}`);
}

module.exports = { sendToQueue };
const initRabbitMQ = require('./rabbitmq');

async function consumeQueue(queue, callback) {
    const { channel } = await initRabbitMQ();

    channel.assertQueue(queue, { durable: true });
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            console.log(`Message received from queue ${queue}: ${msg.content.toString()}`);
            callback(msg.content.toString());
            channel.ack(msg);
        }
    });
}

module.exports = { consumeQueue };
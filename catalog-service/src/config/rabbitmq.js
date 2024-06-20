const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';

const connectRabbitMQ = () => {
    return new Promise((resolve, reject) => {
        amqp.connect(RABBITMQ_URL, (err, connection) => {
            if (err) {
                return reject(err);
            }
            resolve(connection);
        });
    });
}

const createChannel = (connection) => {
    return new Promise((resolve, reject) => {
        connection.createChannel((err, channel) => {
            if (err) {
                return reject(err);
            }
            resolve(channel);
        });
    });
}

module.exports = async () => {
    try {
        const connection = await connectRabbitMQ();
        const channel = await createChannel(connection);

        console.log('RabbitMQ connection established');

        return { connection, channel };
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
        throw error;
    }
}
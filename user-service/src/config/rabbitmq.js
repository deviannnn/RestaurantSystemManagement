const amqp = require('amqplib/callback_api');

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';

let connection = null;
let channel = null;

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
        if(connection && channel)
        {
            return { connection, channel };
        }
        const con = await connectRabbitMQ();
        const cha = await createChannel(con);
        console.log('RabbitMQ connection established');

        connection = con;
        channel = cha;

        return { connection, channel };
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
        throw error;
    }
}
require('dotenv').config();
const amqp = require('amqplib');
const env = process.env.NODE_ENV || 'development';
const config = {
    development: {
        username: process.env.DEV_RABBITMQ_USERNAME,
        password: process.env.DEV_RABBITMQ_PASSWORD,
        host: process.env.DEV_RABBITMQ_HOST,
        port: process.env.DEV_RABBITMQ_PORT
    },
    production: {
        username: process.env.PROD_RABBITMQ_USERNAME,
        password: process.env.PROD_RABBITMQ_PASSWORD,
        host: process.env.PROD_RABBITMQ_HOSTNAME,
        port: process.env.PROD_RABBITMQ_PORT
    }
}[env];

class RabbitMQ {
    constructor() {
        const { username, password, host, port } = config;
        this.rabbitmqUrl = `amqp://${username}:${password}@${host}:${port}`;
        this.connection = null;
        this.channel = null;
    }

    async connect(connectionName = 'OrderService') {
        try {
            if (!this.connection) {
                this.connection = await amqp.connect(this.rabbitmqUrl, { clientProperties: { connection_name: connectionName } });
                this.connection.on('error', (err) => {
                    console.error('RabbitMQ connection error:', err);
                    this.connection = null;
                    this.channel = null;
                });
                this.connection.on('close', () => {
                    console.log('RabbitMQ connection closed');
                    this.connection = null;
                    this.channel = null;
                });

                this.channel = await this.connection.createChannel();
                this.channel.on('error', (err) => {
                    console.error('RabbitMQ channel error:', err);
                    this.channel = null;
                });
                this.channel.on('close', () => {
                    console.log('RabbitMQ channel closed');
                    this.channel = null;
                });
            }
        } catch (error) {
            this.connection = null;
            this.channel = null;
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    async assertQueue(queue) {
        try {
            if (this.channel) {
                await this.channel.assertQueue(queue, { durable: true });
            } else {
                throw new Error('Channel is not available. Call connect() first.');
            }
        } catch (error) {
            console.error('Error asserting queue:', error);
            throw error;
        }
    }

    async assertExchange(exchange, type = 'fanout') {
        try {
            if (this.channel) {
                await this.channel.assertExchange(exchange, type, { durable: true });
            } else {
                throw new Error('Channel is not available. Call connect() first.');
            }
        } catch (error) {
            console.error('Error asserting exchange:', error);
            throw error;
        }
    }

    async publishToQueue(queue, message) {
        try {
            if (!this.connection || !this.channel) await this.connect();

            await this.assertQueue(queue);

            const messageBuffer = Buffer.from(JSON.stringify(message));
            this.channel.sendToQueue(queue, messageBuffer, { persistent: true });

            console.log(`\nPublished message to queue ${queue}: ${messageBuffer.toString()}`);
        } catch (error) {
            console.error('Error publishing message:', error);
            throw error;
        }
    }

    async publishToExchange(exchange, message, routingKey = '') {
        try {
            if (!this.connection || !this.channel) await this.connect();

            await this.assertExchange(exchange);

            const messageBuffer = Buffer.from(JSON.stringify(message));
            this.channel.publish(exchange, routingKey, messageBuffer, { persistent: true });

            console.log(`\nPublished message to exchange ${exchange}: ${messageBuffer.toString()}`);
        } catch (error) {
            throw error;
        }
    }
    
    async consumeExchange(exchange, callback, routingKey = '') {
        try {
            if (!this.connection || !this.channel) {
                await this.connect();
            }

            await this.assertExchange(exchange);

            const q = await this.channel.assertQueue('', { exclusive: true });
            await this.channel.bindQueue(q.queue, exchange, routingKey);

            this.channel.consume(q.queue, (msg) => {
                if (msg !== null) {
                    const message = JSON.parse(msg.content.toString());
                    callback(message);
                    this.channel.ack(msg);
                }
            }, {
                noAck: false
            });

            console.log(`\nListening for messages on exchange: ${exchange}`);
        } catch (error) {
            console.error('Error consuming messages:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.close();
                this.connection = null;
                this.channel = null;
                console.log('Disconnected from RabbitMQ');
            } catch (error) {
                console.error('Error disconnecting from RabbitMQ:', error);
                throw error;
            }
        }
    }
}

module.exports = new RabbitMQ();
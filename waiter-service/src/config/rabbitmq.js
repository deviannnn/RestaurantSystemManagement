const amqp = require('amqplib');

class RabbitMQ {
    constructor() {
        this.rabbitmqUrl = 'amqp://admin:admin@localhost:5672';
        this.connection = null;
        this.channel = null;
        this.subscriptions = new Map(); // Map để lưu các subscription
    }

    async connect(connectionName = 'WaiterService') {
        try {
            if (!this.connection) {
                this.connection = await amqp.connect(this.rabbitmqUrl, { clientProperties: { connection_name: connectionName } });
                this.channel = await this.connection.createChannel();
            }
        } catch (error) {
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

    async consumeQueue(queue, callback) {
        try {
            if (!this.connection || !this.channel) {
                await this.connect();
            }

            await this.assertQueue(queue);

            if (!this.subscriptions.has(queue)) {
                await this.channel.consume(queue, (msg) => {
                    if (msg !== null) {
                        const message = JSON.parse(msg.content.toString());
                        callback(message);
                        this.channel.ack(msg);
                    }
                });
                this.subscriptions.set(queue, callback);
            } else {
                throw new Error(`Already subscribed to queue: ${queue}`);
            }

            console.log(`Listening for messages on queue: ${queue}`);
        } catch (error) {
            console.error('Error consuming message:', error);
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

    async closeConnection() {
        try {
            for (const queue of this.subscriptions.keys()) {
                await this.channel.cancel(queue);
            }

            if (this.connection) {
                await this.connection.close();
                this.connection = null;
                this.channel = null;
                this.subscriptions.clear();
            }
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
            throw error;
        }
    }
}

module.exports = new RabbitMQ();
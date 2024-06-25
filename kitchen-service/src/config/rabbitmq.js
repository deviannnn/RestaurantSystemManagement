const amqp = require('amqplib');

class RabbitMQ {
    constructor() {
        this.rabbitmqUrl = 'amqp://admin:admin@localhost:5672';
        this.connection = null;
        this.channel = null;
        this.subscriptions = new Map(); // Map để lưu các subscription
    }

    async connect(connectionName = 'KitchenService') {
        if (!this.connection) {
            this.connection = await amqp.connect(this.rabbitmqUrl, { clientProperties: { connection_name: connectionName } });
            this.channel = await this.connection.createChannel();
        }
    }

    async assertQueue(queue) {
        if (this.channel) {
            await this.channel.assertQueue(queue, { durable: true });
        } else {
            throw new Error('Channel is not available. Call connect() first.');
        }
    }

    async publishMessage(queue, message) {
        try {
            if (!this.connection || !this.channel) {
                await this.connect();
            }

            await this.assertQueue(queue);

            const messageBuffer = Buffer.from(JSON.stringify(message));
            this.channel.sendToQueue(queue, messageBuffer, { persistent: true });

            console.log(`Published message to queue ${queue}: ${messageBuffer.toString()}`);
        } catch (error) {
            throw error;
        }
    }

    async subMessage(queue, callback) {
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

            console.log(`Subscribed to messages from queue: ${queue}`);
        } catch (error) {
            throw error;
        }
    }

    async closeConnection() {
        for (const queue of this.subscriptions.keys()) {
            await this.channel.cancel(queue);
        }

        if (this.connection) {
            await this.connection.close();
            this.connection = null;
            this.channel = null;
            this.subscriptions.clear();
        }
    }
}

module.exports = new RabbitMQ();
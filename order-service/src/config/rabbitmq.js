const amqp = require('amqplib');

class RabbitMQ {
    constructor() {
        this.rabbitmqUrl = 'amqp://admin:admin@localhost:5672';
        this.connection = null;
        this.channel = null;
    }

    async connect(connectionName = 'OrderService') {
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

            console.log(`\nPublished message to queue ${queue}: ${messageBuffer.toString()}`);
        } catch (error) {
            throw error;
        }
    }

    async closeConnection() {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
            this.channel = null;
        }
    }
}

module.exports = new RabbitMQ();
const amqp = require('amqplib');

class RabbitMQ {
    constructor() {
        this.rabbitmqUrl = 'amqp://admin:admin@localhost:5672';
        this.connection = null;
        this.channel = null;
    }

    async connect(connectionName = 'OrderService') {
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

    async publishToQueue(queue, message) {
        try {
            if (!this.connection || !this.channel) {
                await this.connect();
            }

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
            if (!this.connection || !this.channel) {
                await this.connect();
            }

            await this.assertExchange(exchange);

            const messageBuffer = Buffer.from(JSON.stringify(message));
            this.channel.publish(exchange, routingKey, messageBuffer, { persistent: true });

            console.log(`\nPublished message to exchange ${exchange}: ${messageBuffer.toString()}`);
        } catch (error) {
            throw error;
        }
    }

    async closeConnection() {
        try {
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
                this.channel = null;
            }
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
            throw error;
        }
    }
}

module.exports = new RabbitMQ();
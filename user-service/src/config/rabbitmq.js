const amqp = require('amqplib');

class RabbitMQ {
    constructor() {
        this.rabbitmqUrl = 'amqp://admin:admin@localhost:5672';
        this.connection = null;
        this.channel = null;
    }

    async connect(connectionName = 'UserService') {
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

    async publishMessage(queue, message){
        try {
            if (!this.connection || !this.channel) {
                await this.connect();
            }

            await this.assertQueue(queue);

            this.channel.sendToQueue(queue, Buffer.from(message), {
                persistent: true
            });

            console.log(`Message sent to queue ${queue}: ${message}`);
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
                console.log('RabbitMQ connection closed');
            }
        } catch (error) {
            console.error('Failed to close RabbitMQ connection:', error);
        }
    }
}

module.exports = new RabbitMQ();
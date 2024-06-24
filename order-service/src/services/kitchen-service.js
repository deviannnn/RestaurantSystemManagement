const amqp = require('amqplib');

class KitchenService {
    constructor() {
        this.rabbitmqUrl = 'amqp://admin:admin@localhost:5672';
        this.queue = 'kitchen_orders';
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        if (!this.connection) {
            const connectionOptions = {
                clientProperties: {
                    connection_name: 'OrderService'
                }
            };
            this.connection = await amqp.connect(this.rabbitmqUrl, connectionOptions);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queue, { durable: true });
        }
    }

    async publishOrder(orderData) {
        try {
            if (!this.connection || !this.channel) {
                await this.connect();
            }

            // Chuyển đổi dữ liệu thành chuỗi JSON và gửi vào hàng đợi
            const message = JSON.stringify(orderData);
            this.channel.sendToQueue(this.queue, Buffer.from(message), {
                persistent: true
            });

            console.log(`Published order to kitchen service: ${message}`);
        } catch (error) {
            console.error('Failed to publish order to kitchen service:', error);
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

module.exports = new KitchenService();
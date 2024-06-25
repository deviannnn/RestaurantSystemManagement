const RabbitMQ = require('../config/rabbitmq');

module.exports = {
    async subOrderItem() {
        try {
            await RabbitMQ.subMessage('orders-items-created', (orderData) => {
                console.log('\nReceived order:', orderData);
                //this.processOrder(orderData);
            });

            console.log('Kitchen Service is now listening for orders.');
        } catch (error) {
            console.error('Failed to listen for orders:', error);
            throw error;
        }
    },

    async processOrder(orderData) {
        // Xử lý dữ liệu đơn hàng nhận được
        console.log('Processing order:', orderData);
        // Thêm logic để lưu hoặc xử lý đơn hàng tại đây
        // Ví dụ: Lưu đơn hàng vào cơ sở dữ liệu hoặc gọi API khác để xử lý tiếp
    }
}
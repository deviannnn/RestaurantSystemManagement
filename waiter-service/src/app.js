require('dotenv').config();
const WebSocket = require('ws');
const jwtUtils = require('./utils/jwt');

const WEBSOCKET_PORT = process.env.PORT || 5000;

const wss = new WebSocket.Server({
    port: WEBSOCKET_PORT
});

wss.on('connection', (ws) => {
    console.log('WebSocket client connected.');

    ws.on('close', () => {
        console.log('WebSocket client disconnected.');
    });
});

// Connect to rabbitmq
const RabbitMQ = require('./config/rabbitmq');
(async () => {
    try {
        await RabbitMQ.connect();

        await RabbitMQ.consumeQueue('order-to-waiter', (orderData) => {
            console.log(`Received order:`, orderData);
            // Gửi dữ liệu đơn hàng đến tất cả client đã kết nối qua WebSocket
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(orderData));
                }
            });
        });

        console.log(`RabbitMQ connection established on [${RabbitMQ.rabbitmqUrl}]`);
    } catch (error) {
        console.error('[ERROR] Config -', RabbitMQ.rabbitmqUrl);
        console.error('[ERROR] Failed to connect to RabbitMQ -', error);
        process.exit(1);
    }
})();

console.log(`[WebSocketServer] WaiterService is listening on port: ${WEBSOCKET_PORT}\n`);
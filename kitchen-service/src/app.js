require('dotenv').config();
const WebSocket = require('ws');
const RabbitMQ = require('./config/rabbitmq');
const jwt = require('./utils/jwt');

const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 8080;

const wss = new WebSocket.Server({
    port: WEBSOCKET_PORT,
    // verifyClient: (info, done) => {
    //     const token = info.req.headers['authorization'];
    //     if (!token) {
    //         return done(false, 401, 'Unauthorized');
    //     }

    //     jwt.verifyToken(token.replace('Bearer ', ''))
    //         .then(() => done(true))
    //         .catch(() => done(false, 401, 'Unauthorized'));
    // }
});

wss.on('connection', (ws) => {
    console.log('WebSocket client connected.');

    ws.on('close', () => {
        console.log('WebSocket client disconnected.');
    });
});

(async () => {
    try {
        await RabbitMQ.connect();
        await RabbitMQ.subMessage('orders-items-created', (orderData) => {
            console.log('\n[CREATED] Received order:', orderData);
            // Gửi dữ liệu đơn hàng đến tất cả client đã kết nối qua WebSocket
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(orderData));
                }
            });
        });

        await RabbitMQ.subMessage('orders-items-updated', (orderData) => {
            console.log('\n[UPDATED] Received order:', orderData);
            // Gửi dữ liệu đơn hàng đến tất cả client đã kết nối qua WebSocket
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(orderData));
                }
            });
        });
    } catch (error) {
        console.error('Failed to set up RabbitMQ subscriber:', error);
        process.exit(1); // Exit the process with error
    }
})();

console.log(`[WebSocketServer] KitchenService is listening on port: ${WEBSOCKET_PORT}`);
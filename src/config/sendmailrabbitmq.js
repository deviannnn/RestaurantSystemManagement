const amqp = require('amqplib');
const { sendEmail } = require('../utils/send-mail');
module.exports = async () => {
    const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
    const channel = await connection.createChannel();
    const queue = 'email_queue';

    await channel.assertQueue(queue, { durable: false });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, async (msg) => {
        const message = JSON.parse(msg.content.toString());

        await sendEmail(message.email, message.mailSubject, message.mailHtml);

        console.log(" [x] Received %s", msg.content.toString());
    }, { noAck: true });
}
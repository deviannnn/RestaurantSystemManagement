const bcrypt = require('bcrypt');
const amqp = require('amqplib');
const { User } = require('../models');
const { generateJWT } = require('../utils/jwt');
const { sendEmail } = require('../utils/send-mail');
const { revokedTokens } = require('../middlewares/auth');

const register = async (req, res) => {
    const { roleId, fullName, gender, nationalId, phone, email, password, active } = req.body;

    try {
        let user = await User.findOne({ where: { email } });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            roleId: roleId, 
            fullName: fullName,
            gender: gender,
            nationalId: nationalId,
            phone: phone,
            email: email,
            password: hashedPassword,
            active: active
        });

        const token = await generateJWT(newUser, 'password_change');

        // Gửi yêu cầu gửi email vào hàng đợi RabbitMQ
        const send = await sendEmailRegister(email, token);

        if (send.success) {
            return res.status(201).json({ success: true, title: 'Registered!', message: `Account registered & email sent successfully.` });
        } else {
            return res.status(201).json({ success: true, title: 'Registed!', message: `Account registered successfully but there was an issue with the email.` });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const account = await User.findOne({ where: { email } });

        if (!account || !bcrypt.compareSync(password, account.password)) {
            return res.status(400).json({ success: false, message: 'Invalid username or password.' });
        }
        // if (account.locked === true) {
        //     return res.status(400).json({ success: false, message: 'You cannot access the system because your account has been locked.' });
        // }
        if (!account.active) {
            return res.status(400).json({ success: false, message: 'Your account is not activated yet. Please check your email for verification instructions.' });
        }

        const token = await generateJWT(account, 'login');

        res.cookie('jwt', token, { httpOnly: true });
        // req.session.hello = account.fullName;

        return res.status(200).json({ success: true, token: token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const verifyAccount = async (req, res) => {
    const token = req.body.token;

    try {
        // Tìm tài khoản với token tương ứng và cập nhật trạng thái kích hoạt
        const userverify = await User.findOne({ where: { verificationToken: token } });
        if (!userverify || userverify.verificationToken !== token) {
            throw new Error('Invalid token.');
        }
        // Cập nhật trạng thái kích hoạt của tài khoản và xóa token
        userverify.active = true;
        userverify.verificationToken = null;
        await userverify.save();
        return { success: true, message: 'Account activated successfully.' };

    } catch (error) {
        console.error('Error verifying account:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const logout = (req, res) => {
    const tokenCookie = req.cookies['jwt']; // Lấy token từ cookie
    const tokenFromBody = req.body.token; // Lấy token từ phần thân của yêu cầu

    if (!tokenCookie || !tokenFromBody || tokenCookie !== tokenFromBody) {
        return res.status(400).json({ success: false, message: 'Token is required or invalid.' });
    }

    revokedTokens.add(tokenCookie);

    res.clearCookie('jwt');
    return res.status(200).json({ success: true, message: 'Account logout' });
};

// Hàm này đẩy yêu cầu gửi email vào hàng đợi RabbitMQ
const sendEmailRegister = async (email, resetToken) => {
    const mailSubject = 'Account Verification';
    const mailHtml = `Your verification token is: ${resetToken}`;

    const message = { email, mailSubject, mailHtml };

    // Kết nối tới RabbitMQ trong Docker
    const connection = await amqp.connect('amqp://guest:guest@localhost:5672');
    const channel = await connection.createChannel();
    const queue = 'email_queue';

    // Đảm bảo hàng đợi tồn tại
    await channel.assertQueue(queue, { durable: false });

    // Gửi tin nhắn vào hàng đợi
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    // Đóng kết nối
    setTimeout(() => {
        connection.close();
    }, 500);

    // Trả về thông báo thành công
    return { success: true };
}

// Consumer xử lý yêu cầu gửi email từ hàng đợi RabbitMQ
const consumeEmailRequests = async () => {
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

module.exports = {
    register,
    login,
    logout,
    verifyAccount,
    sendEmailRegister,
    consumeEmailRequests
};

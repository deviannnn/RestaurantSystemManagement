const { consumeQueue } = require('../config/consumer');
const { sendEmail } = require('../services/mail.service');

class NotificationController {
    static async register(req, res) {
        try {
            
            return res.status(201).json({ msg: 'Complete send email!' });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

}
module.exports = NotificationController;
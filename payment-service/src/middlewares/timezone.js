const { format, toZonedTime } = require('date-fns-tz');
require('dotenv').config();

const timeZone = process.env.TIMEZONE || '+07:00';

const convertTimezone = (req, res, next) => {
    const oldJson = res.json;
    
    res.json = function (data) {
        if (Array.isArray(data)) {
            data = data.map(item => convertTimestamps(item));
        } else if (typeof data === 'object' && data !== null) {
            data = convertTimestamps(data);
        }
        oldJson.call(res, data);
    };

    next();
};

const convertTimestamps = (data) => {
    for (const key in data) {
        if (data.hasOwnProperty(key) && (key === 'createdAt' || key === 'updatedAt')) {
            const zonedDate = toZonedTime(data[key], timeZone);
            data[key] = format(zonedDate, "dd-MM-yyyy HH:mm:ss XXX", { timeZone });
        }
    }
    return data;
};

module.exports = convertTimezone;
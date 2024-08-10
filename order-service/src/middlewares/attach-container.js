const os = require('os');

const attachContainerName = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        const responseData = {
            container: os.hostname() + 'load test/stress test',
            ...data
        };
        originalJson.call(this, responseData);
    };
    next();
};

module.exports = { attachContainerName };
require('dotenv').config();

const createRoute = (route, service) => {
    const protocol = process.env[`${service}_PROTOCAL`];
    const hostname = process.env[`${service}_HOSTNAME`];
    const port = process.env[`${service}_PORT`];

    return { route, protocol, target: `${protocol}://${hostname}:${port}` };
};

module.exports = [
    createRoute('/catalogs', 'CATALOG_SERVICE'),
    createRoute('/categories', 'CATALOG_SERVICE'),
    createRoute('/items', 'CATALOG_SERVICE'),

    createRoute('/orders', 'ORDER_SERVICE'),
    createRoute('/orders-items', 'ORDER_SERVICE'),

    createRoute('/payments', 'PAYMENT_SERVICE'),
    createRoute('/surcharges', 'PAYMENT_SERVICE'),
    createRoute('/payments-surcharges', 'PAYMENT_SERVICE'),

    createRoute('/tables', 'TABLE_SERVICE'),

    createRoute('/auth', 'USER_SERVICE'),
    createRoute('/users', 'USER_SERVICE'),
    createRoute('/roles', 'USER_SERVICE'),

    createRoute('/ws/kitchens', 'KITCHEN_SERVICE'),
    createRoute('/ws/waiters', 'WAITER_SERVICE')
];

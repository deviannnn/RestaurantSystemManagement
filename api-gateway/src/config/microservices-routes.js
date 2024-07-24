require('dotenv').config();

module.exports = [
    { route: "/catalogs", target: `http://${process.env.CATALOG_SERVICE}/catalogs` },
    { route: "/categories", target: `http://${process.env.CATALOG_SERVICE}/categories` },
    { route: "/items", target: `http://${process.env.CATALOG_SERVICE}/items` },

    { route: "/orders", target: `http://${process.env.ORDER_SERVICE}/orders` },
    { route: "/orders-items", target: `http://${process.env.ORDER_SERVICE}/orders-items` },

    { route: "/payments", target: `http://${process.env.PAYMENT_SERVICE}/payments` },
    { route: "/surcharges", target: `http:/${process.env.PAYMENT_SERVICE}/surcharges` },
    { route: "/payments-surcharges", target: `http:/${process.env.PAYMENT_SERVICE}/payments-surcharges` },

    { route: "/tables", target: `http://${process.env.TABLE_SERVICE}/tables` },

    { route: "/auth", target: `http://${process.env.USER_SERVICE}/auth` },
    { route: "/users", target: `http://${process.env.USER_SERVICE}/users` },
    { route: "/roles", target: `http://${process.env.USER_SERVICE}/roles` }
]
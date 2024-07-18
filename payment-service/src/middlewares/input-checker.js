const axios = require('axios');
const createError = require('http-errors');
const { check } = require('express-validator');
const validator = require('./vaildator');

const OrderService = process.env.CATALOG_SERVICE_HOSTNAME || 'http://localhost:5002';
const SurchargeService = require('../services/surcharge-service');

module.exports = {
    checkBodyOrder: [
        check('orderId').notEmpty().withMessage('Order ID cannot be empty'),
        validator
    ],

    checkOrderExist: async (req, res, next) => {
        const orderId = req.body.orderId;

        if (!orderId) {
            return next();
        }

        try {
            const response = await axios.get(`${OrderService}/orders/${orderId}`);
            req.order = response.data.data.order;
            return next();
        } catch (error) {
            return res.status(error.response.status).json(error.response.data);
        }
    },

    checkOrderInProgress: async (req, res, next) => {
        try {
            const orderData = req.order;
            if (!orderData || orderData.active || orderData.status !== 'in_progress') return next(createError(400, 'Order not in progress'));
            return next();
        } catch (error) {
            return next(error);
        }
    },

    // { totalDiscount, note } = req.body;
    checkBodyCreatePayment: [
        check('totalDiscount').optional().notEmpty().isFloat({ min: 0 }).withMessage('Payment TotalDiscount must be a real number > 0'),
        check('note').optional().isString().withMessage('Payment Note must be a string'),
        validator
    ],
    
    // { surchargeIds } = req.body;
    checkBodySurchargeIds: [
        check('surchargeIds').isArray({ min: 1 }).withMessage('Payment SurchargeIds must be a non-empty array'),
        validator,
        async (req, res, next) => {
            try {
                const surchargeIds = req.body.surchargeIds;

                const { validSurcharges, invalidSurcharges } = await SurchargeService.getSurchargesByListIds(surchargeIds);
                if (invalidSurcharges.length > 0) {
                    return next(createError(400, 'Some surcharges are not valid', { data: { surcharges: invalidSurcharges } }));
                }

                req.surcharges = validSurcharges;
                return next();
            } catch (error) {
                return next(error);
            }
        }
    ]
};
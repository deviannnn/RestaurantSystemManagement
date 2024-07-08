const createError = require('http-errors');
const TableService = require('../services/table-service');
const { check } = require('express-validator');
const validator = require('../middlewares/input-validator');

module.exports = {
    createTable: [
        check('no')
            .notEmpty().withMessage('Table no cannot be empty')
            .isString().withMessage('Table no must be a string'),
        check('capacity')
            .notEmpty().withMessage('Capacity cannot be empty')
            .isInt({ min: 1 }).withMessage('Capacity must be an integer > 0'),
        check('isVip')
            .optional()
            .notEmpty().withMessage('VIP status cannot be empty')
            .isBoolean().withMessage('VIP status must be a boolean'),
        check('status')
            .optional()
            .notEmpty().withMessage('Status cannot be empty')
            .isIn(['free', 'occupied', 'reserved']).withMessage('Status must be either free, occupied, or reserved'),
        check('active')
            .optional()
            .notEmpty().withMessage('Active status cannot be empty')
            .isBoolean().withMessage('Active status must be a boolean'),
        validator,
        async (req, res, next) => {
            try {
                const { no, capacity, isVip, status, active } = req.body;
                const newTable = await TableService.createTable(no, capacity, isVip, status, active);
                return res.status(201).json({
                    success: true,
                    message: 'Create table sucessfully!',
                    data: { table: newTable }
                });
            } catch (error) {
                next(error);
            }
        }
    ],

    // Get all tables or get table by ID
    async getTables(req, res, next) {
        try {
            const { id } = req.params;
            if (id) {
                const table = await TableService.getTableById(id);
                if (table) {
                    return res.status(200).json({
                        sucess: true,
                        message: 'Get table successfully!',
                        data: { table }
                    });
                } else {
                    next(createError(404, 'Table not found'));
                }
            } else {
                const tables = await TableService.getAllTables();
                return res.status(200).json({
                    sucess: true,
                    message: 'Get all tables successfully!',
                    data: { tables }
                });
            }
        } catch (error) {
            next(error);
        }
    },

    // Update table by ID
    updateTable: [
        check('no')
            .optional()
            .notEmpty().withMessage('Table no cannot be empty.')
            .isString().withMessage('Table no must be a string.'),
        check('capacity')
            .optional()
            .notEmpty().withMessage('Capacity cannot be empty.')
            .isInt({ min: 1 }).withMessage('Capacity must be a positive integer.'),
        check('isVip').optional()
            .notEmpty().withMessage('VIP status cannot be empty.')
            .isBoolean().withMessage('VIP status must be a boolean.'),
        check('status')
            .optional()
            .notEmpty().withMessage('Status cannot be empty.')
            .isIn(['free', 'occupied', 'reserved']).withMessage('Status must be either free, occupied, or reserved.'),
        check('active')
            .optional()
            .notEmpty().withMessage('Active status cannot be empty.')
            .isBoolean().withMessage('Active status must be a boolean.'),
        validator,
        async (req, res, next) => {
            try {
                const { id } = req.params;
                const { no, capacity, isVip, status, active } = req.body;
                const updatedTable = await TableService.updateTable({ id, no, capacity, isVip, status, active });
                if (updatedTable) {
                    return res.status(200).json({
                        sucess: true,
                        message: 'Update table successfully!',
                        data: { table: updatedTable }
                    });
                } else {
                    return next(createError(404, 'Table not found'));
                }
            } catch (error) {
                next(error);
            }
        }
    ],

    // Delete table by ID
    async deleteTable(req, res, next) {
        try {
            const { id } = req.params;
            const deletedTable = await TableService.deleteTable(id);
            if (deletedTable) {
                return res.status(200).json({
                    success: true,
                    message: 'Delete table successfully!',
                    data: { deletedTable }
                });
            } else {
                return res.status(404).json({ sucess: false, error: { message: 'Table not found', data: {} } });
            }
        } catch (error) {
            next(error);
        }
    },
};
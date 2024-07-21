const createError = require('http-errors');
const inputChecker = require('../middlewares/input-checker');

const TableService = require('../services/table-service');

module.exports = {
    /** Expected Input
     * 
     * { no, capacity, isVip, status, active } = req.body
     * 
     */
    createTable: [
        inputChecker.checkBodyCreateTable,
        async (req, res, next) => {
            try {
                const { no, capacity, isVip, status, active } = req.body;

                const newTable = await TableService.createTable({ no, capacity, isVip, status, active });
                return res.status(201).json({
                    success: true,
                    message: 'Create table sucessfully!',
                    data: { table: newTable }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * tableId ? = req.params
     * 
     */
    async getTables(req, res, next) {
        try {
            const { tableId } = req.params;
            if (tableId) {
                const table = await TableService.getTableById(tableId);
                if (!table) return next(createError(404, 'Table not found'));
                res.status(200).json({
                    sucess: true,
                    message: 'Get table successfully!',
                    data: { table }
                });
            } else {
                const tables = await TableService.getAllTables();
                res.status(200).json({
                    sucess: true,
                    message: 'Get all tables successfully!',
                    data: { tables }
                });
            }
        } catch (error) {
            return next(error);
        }
    },

    /** Expected Input
     * 
     * tableId = req.params
     * { no, capacity, isVip, status, active } = req.body
     * 
     */
    updateTable: [
        inputChecker.checkBodyUpdateTable,
        async (req, res, next) => {
            try {
                const { tableId } = req.params;
                const { no, capacity, isVip, status, active } = req.body;

                const updatedTable = await TableService.updateTable({ id: tableId, no, capacity, isVip, status, active });
                if (!updatedTable) return next(createError(404, 'Table not found'));

                res.status(200).json({
                    sucess: true,
                    message: 'Update table successfully!',
                    data: { table: updatedTable }
                });
            } catch (error) {
                return next(error);
            }
        }
    ],

    /** Expected Input
     * 
     * tableId = req.params
     * 
     */
    async deleteTable(req, res, next) {
        try {
            const { tableId } = req.params;

            const deletedTable = await TableService.deleteTable(tableId);
            if (!deletedTable) return next(createError(404, 'Table not found'));

            res.status(200).json({
                success: true,
                message: 'Delete table successfully!',
                data: { table: deletedTable }
            });
        } catch (error) {
            return next(error);
        }
    },
};
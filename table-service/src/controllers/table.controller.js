const TableService = require('../services/table.service');

class TableController {
    // Create a new table
    static async createTable(req, res, next) {
        try {
            const { no, capacity, isVip, status, active } = req.body;
            const newTable = await TableService.createTable(no, capacity, isVip, status, active);
            res.status(201).json({
                success: true,
                message: 'Create table sucessfull!',
                data: {newTable}
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all tables or get table by ID
    static async getTables(req, res, next) {
        try {
            const { id } = req.params;
            if (id) {
                const table = await TableService.getTableById(id);
                if (table) {
                    res.status(200).json({
                        sucess: true,
                        message: 'Get table successfull!',
                        data: {table}
                    });
                } else {
                    res.status(404).json({ error: 'Table not found' });
                }
            } else {
                const tables = await TableService.getAllTables();
                res.status(200).json(
                    { 
                        sucess: true,
                        message: 'Get all table successfull!',
                        data: {tables}
                    });
            }
        } catch (error) {
            next(error);
        }
    }

    // Update table by ID
    static async updateTable(req, res, next) {
        try {
            const { id } = req.params;
            const { no, capacity, isVip, status, active } = req.body;
            const updatedTable = await TableService.updateTable(id, no, capacity, isVip, status, active);
            if (updatedTable) {
                res.status(200).json({
                    sucess: true,
                    message: 'Update table successfull!',
                    data: {updatedTable}
                });
            } else {
                res.status(404).json({ 
                    sucess: false,
                    message: 'Table not found',
                    data: {},
                });
            }
        } catch (error) {
            next(error);
        }
    }

    // Delete table by ID
    static async deleteTable(req, res, next) {
        try {
            const { id } = req.params;
            const deletedTable = await TableService.deleteTable(id);
            if (deletedTable) {
                res.status(200).json({
                    success: true,
                    message: 'Delete table successful!',
                    data: {deletedTable}
                });
            } else {
                res.status(404).json({ 
                    success: false,
                    message: 'Table not found',
                    data: {} 
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TableController;
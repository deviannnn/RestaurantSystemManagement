const TableService = require('../services/table.service');

class TableController {
    // Create a new table
    static async createTable(req, res) {
        try {
            const { no, capacity, isVip, status, active } = req.body;
            const newTable = await TableService.createTable(no, capacity, isVip, status, active);
            res.status(201).json(newTable);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all tables or get table by ID
    static async getTables(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const table = await TableService.getTableById(id);
                if (table) {
                    res.status(200).json(table);
                } else {
                    res.status(404).json({ error: 'Table not found' });
                }
            } else {
                const tables = await TableService.getAllTables();
                res.status(200).json(tables);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update table by ID
    static async updateTable(req, res) {
        try {
            const { id } = req.params;
            const { no, capacity, isVip, status, active } = req.body;
            const updatedTable = await TableService.updateTable(id, no, capacity, isVip, status, active);
            if (updatedTable) {
                res.status(200).json(updatedTable);
            } else {
                res.status(404).json({ error: 'Table not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete table by ID
    static async deleteTable(req, res) {
        try {
            const { id } = req.params;
            const deletedTable = await TableService.deleteTable(id);
            if (deletedTable) {
                res.status(200).json(deletedTable);
            } else {
                res.status(404).json({ error: 'Table not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TableController;
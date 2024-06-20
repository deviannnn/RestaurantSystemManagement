const { Table } = require('../models');

class TableService {
    static async createTable(no, capacity, isVip, status, active) {
        return Table.create({ no, capacity, isVip, status, active })
            .then((newTable) => newTable.get({ plain: true }));
    }

    static async getTableById(id) {
        return Table.findByPk(id);
    }

    static async getAllTables() {
        return Table.findAll();
    }

    static async updateTable(id, no, capacity, isVip, status, active) {
        const [updated] = await Table.update({ no, capacity, isVip, status, active }, { where: { id } });
        if (updated) {
            return Table.findByPk(id);
        }
        return null;
    }

    static async deleteTable(id) {
        const table = await Table.findByPk(id);
        if (table) {
            await Table.destroy({ where: { id } });
            return table;
        }
        return null;
    }
}

module.exports = TableService;
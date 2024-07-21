const { Table } = require('../models');

module.exports = {
    async createTable({ no, capacity, isVip, status, active }) {
        try {
            const newTable = await Table.create({ no, capacity, isVip, status, active });
            return newTable;
        } catch (error) {
            console.error('Error creating table:', error);
            throw error;
        }
    },

    async getTableById(id) {
        try {
            return await Table.findByPk(id);
        } catch (error) {
            console.error('Error getting table by Id:', error);
            throw error;
        }
    },

    async getAllTables() {
        try {
            return await Table.findAll();
        } catch (error) {
            console.error('Error getting all tables:', error);
            throw error;
        }
    },

    async updateTable({ id, no, capacity, isVip, status, active }) {
        try {
            const [updated] = await Table.update({ no, capacity, isVip, status, active }, { where: { id } });
            if (updated) {
                return Table.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error updating table:', error);
            throw error;
        }
    },

    async deleteTable(id) {
        try {
            const table = await Table.findByPk(id);
            if (table) {
                await Table.destroy({ where: { id } });
                return table;
            }
            return null;
        } catch (error) {
            console.error('Error deleting table:', error);
            throw error;
        }
    }
};
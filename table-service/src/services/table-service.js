const { Table } = require('../models');

module.exports = {
    async createTable(no, capacity, isVip, status, active) {
        try {
            return Table.create({ no, capacity, isVip, status, active })
            .then((newTable) => newTable.get({ plain: true }));
        } catch (error) {
            console.error('Error create table:', error);
            throw error;
        }
    },

    async getTableById(id) {
        try {
            return Table.findByPk(id);
        } catch (error) {
            console.error('Error get table by Id:', error);
            throw error;
        }      
    },

    async getAllTables() {
        try {
            return Table.findAll();
        } catch (error) {
            console.error('Error get all tables:', error);
            throw error;
        }
    },

    async updateTable({id, no, capacity, isVip, status, active}) {
        try {
            const [updated] = await Table.update({ no, capacity, isVip, status, active }, { where: { id } });
            if (updated) {
                return Table.findByPk(id);
            }
            return null;
        } catch (error) {
            console.error('Error update tables:', error);
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
            console.error('Error delete table:', error);
            throw error;
        }
    }
};
const { Cart, Order, Item } = require('../models');

class CartService {
    static async createCart(orderId, itemId, quantity, amount, note) {
        return Cart.create({ orderId, itemId, quantity, amount, note })
            .then(newCart => newCart.get({ plain: true }));
    }

    static async getCartById(id) {
        return Cart.findByPk(id, {
            include: [
                { model: Order, as: 'order' },
                { model: Item, as: 'item' }
            ]
        });
    }

    static async getAllCarts() {
        return Cart.findAll({
            include: [
                { model: Order, as: 'order' },
                { model: Item, as: 'item' }
            ]
        });
    }

    static async updateCart(id, quantity, amount, note, status, active) {
        const [updated] = await Cart.update({ quantity, amount, note, status, active }, { where: { id } });
        if (updated) {
            return Cart.findByPk(id, {
                include: [
                    { model: Order, as: 'order' },
                    { model: Item, as: 'item' }
                ]
            });
        }
        return null;
    }

    static async deleteCart(id) {
        const cart = await Cart.findByPk(id);
        if (cart) {
            await Cart.destroy({ where: { id } });
            return cart;
        }
        return null;
    }
}

module.exports = CartService;
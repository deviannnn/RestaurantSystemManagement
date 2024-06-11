const CartService = require('../services/cart.service');
const ItemService = require('../services/item.service');

class CartController {
    // Create a new cart
    static async createCart(req, res) {
        try {
            const { orderId, itemId, quantity, note, status, active } = req.body;

            // Fetch the item to get the price
            const item = await ItemService.getItemById(itemId);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }

            // Calculate amount
            const amount = quantity * item.price;

            const newCart = await CartService.createCart(orderId, itemId, quantity, amount, note, status, active);
            res.status(201).json(newCart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Get all carts or get cart by ID
    static async getCarts(req, res) {
        try {
            const { id } = req.params;
            if (id) {
                const cart = await CartService.getCartById(id);
                if (cart) {
                    res.status(200).json(cart);
                } else {
                    res.status(404).json({ error: 'Cart not found' });
                }
            } else {
                const carts = await CartService.getAllCarts();
                res.status(200).json(carts);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update cart by ID
    static async updateCart(req, res) {
        try {
            const { id } = req.params;
            const { quantity, note, status, active } = req.body;

            const cart = await CartService.getCartById(id);
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            const item = await ItemService.getItemById(cart.itemId);
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }

            // Calculate amount
            const amount = quantity * item.price;

            const updatedCart = await CartService.updateCart(id, quantity, amount, note, status, active);
            if (updatedCart) {
                res.status(200).json(updatedCart);
            } else {
                res.status(404).json({ error: 'Cart not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete cart by ID
    static async deleteCart(req, res) {
        try {
            const { id } = req.params;
            const deletedCart = await CartService.deleteCart(id);
            if (deletedCart) {
                res.status(200).json(deletedCart);
            } else {
                res.status(404).json({ error: 'Cart not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CartController;
const express = require('express');
const router = express.Router();
const CartController = require('../../controllers/cart.controller');

router.post('/', CartController.createCart);
router.get('/:id?', CartController.getCarts);
router.put('/:id', CartController.updateCart);
router.delete('/:id', CartController.deleteCart);

module.exports = router;
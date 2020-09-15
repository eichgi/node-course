const express = require('express');
const shopController = require('../controllers/shop');
const isAuth = require('./../middlewares/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
router.post('/cart', isAuth, shopController.postCart);
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct)
router.get('/orders', isAuth, shopController.getOrders);
router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;
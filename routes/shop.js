const express = require('express');
const shopController = require('../controllers/shop');
const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
//router.delete('/products/delete', shopController.getProductById);
router.get('/products/:productId', shopController.getProduct);
router.post('/cart', shopController.postCart);
router.get('/cart', shopController.getCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct)
router.get('/orders', shopController.getOrders);
router.get('/checkout', shopController.getCheckout);
router.post('/create-order', shopController.postOrder);

module.exports = router;
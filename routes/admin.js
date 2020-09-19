const express = require('express');
const {check} = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('./../middlewares/is-auth');

const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product',
  [
  check('title').isString().isLength({min: 3,}).trim(),
  //check('imageUrl').isURL().trim(),
  check('price').isFloat().trim(),
  check('description').isLength({min: 5, max: 400}).trim(),
], isAuth, adminController.postAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.post('/edit-product',
  [
    check('title').isString().isLength({min: 3,}).trim(),
    check('price').isFloat().trim(),
    check('description').isLength({min: 5, max: 400}).trim(),
  ],
  isAuth, adminController.postEditProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
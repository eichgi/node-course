const path = require('path');
const express = require('express');
const rootDir = require('../util/path');

const router = express.Router();
const adminData = require('./admin');

router.get('/', (req, res, next) => {
  /*console.log(adminData.products);
  res.sendFile(path.join(rootDir, 'views', 'shop_previous.html'));*/
  const products = adminData.products;
  res.render('shop', {
    prods: products,
    docTitle: 'Shop X',
    path: '/',
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true,
    formsCSS: true,
  });
});

module.exports = router;
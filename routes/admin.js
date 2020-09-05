const path = require('path');
const express = require('express');
const rootDir = require('../util/path');

const router = express.Router();

const products = [];

router.get('/add-product', (req, res) => {
  res.render('add-product', {
    docTitle: 'Add product',
    path: '/admin/add-product',
    productCSS: true,
    formsCSS: true,
    activeAddProduct: true,
  });
  //res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

router.post('/add-product', (req, res) => {
  products.push({
    title: req.body.title,
  });
  res.redirect('/');
});

//module.exports = router;
exports.routes = router;
exports.products = products;
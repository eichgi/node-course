const Product = require('./../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All products',
      path: '/products',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
      formsCSS: true,
    });
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    console.log('PRODUCTS TYPE: ', typeof products);
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop X',
      path: '/',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
      formsCSS: true,
    });
  });
};

exports.getCart = (req, res, next) => {
  res.render('shop/cart', {
    path: '/cart',
    pageTitle: '/Your cart',
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Orders',
  });
}
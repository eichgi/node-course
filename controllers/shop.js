const Product = require('./../models/product');
const Cart = require('./../models/cart');

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
  Cart.getProducts((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (product of products) {
        const cartProductData = cart.products.find(prod => prod.id === product.id);
        if (cartProductData) {
          cartProducts.push({productData: product, qty: cartProductData.qty});
        }
      }
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: '/Your cart',
        products: cartProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const {productId} = req.body;
  Product.findById(productId, (product) => {
    Cart.addProduct(productId, product.price);
  });
  res.redirect('/cart');
  // res.render('shop/cart', {
  //   path: '/cart',
  //   pageTitle: '/Your cart',
  // });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  })
}

exports.postCartDeleteProduct = (req, res, next) => {
  const {productId} = req.body;
  Product.findById(productId, product => {
    Cart.deleteProduct(productId, product.price);
  });

  res.redirect('/cart');
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Orders',
  });
}

exports.getProduct = (req, res, next) => {
  const {productId} = req.params;
  Product.findById(productId, product => {
    console.log(product);

    res.render('shop/product-detail', {
      product,
      pageTitle: 'Product ' + product.title,
      path: '/products',
    });
  });
}
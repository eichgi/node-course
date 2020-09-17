const Product = require('./../models/product');
const Order = require('./../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    }).catch(error => {
    console.log(error);
  });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'All products',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
      });
    }).catch(error => {
    console.log(error);
  });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      console.log(user.cart.items);
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: '/Your cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn,
      });
    }).catch(error => {
    console.log(error);
  });
};

exports.postCart = (req, res, next) => {
  const {productId} = req.body;

  Product.findById(productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error('Production creation failed.')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  })
}

exports.postCartDeleteProduct = (req, res, next) => {
  const {productId} = req.body;

  req.user.removeFromCart(productId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error('Production creation failed.')
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']})
    .then(orders => {
      console.log(orders[0].products);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Orders',
        orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    }).catch(error => {
    console.log(error);
  });
}

exports.getProduct = (req, res, next) => {
  const {productId} = req.params;
  Product.findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: 'Product ' + product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    });
}

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(product => {
        return {
          product: {...product.productId._doc},
          quantity: product.quantity,
        }
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });

      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error('Production creation failed.')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
    .then(orders => {
      console.log(orders);

      res.render('shop/orders', {
        orders,
        pageTitle: 'Your orders',
        path: '/orders',
        isAuthenticated: req.session.isLoggedIn,
      });
    }).catch(error => {
    console.log(error);
  })
}

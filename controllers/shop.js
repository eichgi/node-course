const Product = require('./../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products',
      });
    }).catch(error => {
    console.log(error);
  });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'All products',
        path: '/',
      });
    }).catch(error => {
    console.log(error);
  });
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: '/Your cart',
        products: products,
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
    .catch(error => {
      console.log(error);
    })
  /*let fetchedCart;
  let newQuantity = 1;

  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({where: {id: productId}});
    })
    .then(products => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }

      return Product.findByPk(productId);
    })
    .then(product => {
      return fetchedCart.addProduct(product, {
        through: {quantity: newQuantity},
      });
    })
    .then(response => {
      res.redirect('/cart');
    })
    .catch(error => {
      console.log(error);
    });*/
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

  req.user.deleteItemFromCart(productId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(error => {
      console.log(error);
    })
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ['products']})
    .then(orders => {
      console.log(orders[0].products);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Orders',
        orders,
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
      });
    });
}

exports.postOrder = (req, res, next) => {
  req.user.addOrder()
    .then(result => {
      res.redirect('/orders');
    })
    .catch(error => {
      console.log(error);
    });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders()
    .then(orders => {
      console.log(orders);

      res.render('shop/orders', {
        orders,
        pageTitle: 'Your orders',
        path: '/orders',
      });
    }).catch(error => {
    console.log(error);
  })
}

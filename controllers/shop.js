const Product = require('./../models/product');

exports.getProducts = (req, res, next) => {
  Product.findAll()
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
  Product.findAll()
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
    .then(cart => {
      //console.log(cart);
      return cart.getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: '/Your cart',
            products: products,
          });
        }).catch(error => {
          console.log(error);
        });
    }).catch(error => {
    console.log(error);
  });
};

exports.postCart = (req, res, next) => {
  const {productId} = req.body;
  let fetchedCart;
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
    });
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
  req.user.getCart()
    .then(cart => {
      return cart.getProducts({where: {id: productId}});
    })
    .then(products => {
      const product = products[0];
      product.cartItem.destroy();
    })
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
  Product.findAll({
    where: {id: productId}
  }).then(products => {
    console.log(products);
    res.render('shop/product-detail', {
      product: products[0],
      pageTitle: 'Product ' + products[0].title,
      path: '/products',
    });
  });
}

exports.postOrder = (req, res, next) => {
  let fetchedCart;

  req.user.getCart()
    .then(cart => {
      console.log(cart);
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      console.log(products);
      return req.user.createOrder()
        .then(order => {
          return order.addProducts(products.map(product => {
            //return {...product, orderItem: {quantity: product.cartItem.quantity}};
            product.orderItem = {quantity: product.cartItem.quantity};
            return product;
          }));
        }).catch(error => {
          console.log(error);
        });
    })
    .then(result => {
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(error => {
      console.log(error);
    });
}
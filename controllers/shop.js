const dotenv = require('dotenv');
dotenv.config();
const Product = require('./../models/product');
const Order = require('./../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems;

  Product.find()
    .countDocuments()
    .then(count => {
      totalItems = count;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
        currentPage: page,
        hasNextPage: totalItems > page * ITEMS_PER_PAGE,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    }).catch(error => {
    console.log(error);
  });

  /*Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    }).catch(error => {
    console.log(error);
  });*/
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems;

  Product.find()
    .countDocuments()
    .then(count => {
      totalItems = count;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'All products',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
        currentPage: page,
        hasNextPage: totalItems > page * ITEMS_PER_PAGE,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  let products;
  let total = 0;

  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      console.log(user.cart.items);
      products = user.cart.items;
      total = 0;
      products.forEach(product => {
        total += product.quantity * product.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card',],
        line_items: products.map(product => {
          return {
            name: product.productId.title,
            description: product.productId.description,
            amount: product.productId.price * 100,
            currency: 'usd',
            quantity: product.quantity,
          }
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch(error => {
      console.log(error);
    });
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

exports.getCheckoutSuccess = (req, res, next) => {
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

exports.getInvoice = (req, res, next) => {
  const {orderId} = req.params;

  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found'));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized access'))
      }

      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice');
      pdfDoc.text('--------------------');

      let totalPrice = 0;
      order.products.forEach(product => {
        totalPrice += product.quantity * product.product.price;
        pdfDoc.text(`${product.product.title} - ${product.quantity}x $${product.product.price}`);
      });

      pdfDoc.fontSize(20).text(`Total price $${totalPrice}`);

      pdfDoc.end();

      /*fs.readFile(invoicePath, (error, data) => {
        if (error) {
          return next(error);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        res.send(data);
      });*/

      /*const file = fs.createReadStream(invoicePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
      file.pipe(res);*/
    })
    .catch(error => {
      console.log(error);
    });
}
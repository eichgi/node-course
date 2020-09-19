const Product = require('./../models/product');
const {validationResult} = require('express-validator');
const fileHelper = require('./../util/file');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res) => {
  const {title, price, description} = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      validationErrors: [],
      errorMessage: 'Invalid image',
    });
  }

  const imageUrl = image.path;

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
    });
  }

  const product = new Product({title, price, description, imageUrl, userId: req.user,});
  product.save()
    .then(response => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error('Production creation failed.')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    //.select('title price -_id')
    //.populate('userId')
    .then(products => {
      console.log(products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn,
      });
    }).catch(error => {
    console.log(error);
  });
}


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect('/admin/products');
  }

  const {productId} = req.params;
  Product.findById(productId)
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit product',
        path: '/admin/edit-product',
        hasError: false,
        editing: editMode,
        product: product,
        errorMessage: null,
        validationErrors: [],
      });
    }).catch(error => {
    console.log(error);
  });
};

exports.postEditProduct = (req, res, next) => {
  const {title, price, description, productId} = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit product',
      path: '/admin/edit-product/',
      editing: true,
      hasError: true,
      product: {
        title,
        imageUrl,
        price,
        description,
        _id: productId,
      },
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
    });
  }

  Product.findById(productId)
    .then(product => {
      console.log("Product: ", product);
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      product.title = title;
      product.price = price;
      product.description = description;
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      return product.save()
        .then(result => {
          res.redirect('/admin/products');
        });
    })
    .catch(err => {
      const error = new Error('Production creation failed.')
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.deleteProduct = (req, res, next) => {
  const {productId} = req.params;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return next(new Error('Product not found'));
      }
      fileHelper.deleteFile(product.imageUrl);

      return Product.deleteOne({_id: productId, userId: req.user._id});
    })
    .then(response => {
      res.status(200).json({message: 'Product deleted'});
      //res.redirect('/admin/products');
    })
    .catch(error => {
      res.status(500).json({message: 'Deleting product failed'});
    });
}
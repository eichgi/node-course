const Product = require('./../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res) => {
  const {title, imageUrl, price, description} = req.body;

  const product = new Product(title, price, description, imageUrl, null, req.user._id);
  product.save()
    .then(response => {
      console.log(response);
      res.redirect('/admin/products');
    }).catch(error => {
    console.log(error);
  });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
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
        editing: editMode,
        product: product,
      });
    }).catch(error => {
    console.log(error);
  });
};

exports.postEditProduct = (req, res, next) => {
  const {title, price, description, imageUrl, productId} = req.body;

  const product = new Product(title, price, description.trim(), imageUrl, productId);
  product.save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(error => {
      console.log(error);
    });
}

exports.postDeleteProduct = (req, res, next) => {
  const {productId} = req.body;
  Product.deleteById(productId)
    .then(response => {
      console.log(response);
      res.redirect('/admin/products');
    }).catch(error => {
    console.log(error);
  });
}
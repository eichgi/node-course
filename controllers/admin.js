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
  const product = new Product(null, title, imageUrl, price, description);
  product.save()
    .then(result => {
      res.redirect('/admin/products');
    }).catch(error => {
    console.log(error);
  });
  res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect('/admin/products');
  }

  const {productId} = req.params;

  Product.findById(productId, (product) => {
    if (!product) {
      res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit product',
      path: '/admin/edit-product',
      editing: editMode,
      product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const {title, price, description, imageUrl, productId} = req.body;
  const updatedProduct = new Product(productId, title, imageUrl, price, description);
  updatedProduct.save();
  res.redirect('/admin/products');
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(([rows]) => {
      res.render('admin/products', {
        prods: rows,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    }).catch(error => {
    console.log(error);
  });
  /*Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
      hasProducts: products.length > 0,
      activeShop: true,
      productCSS: true,
      formsCSS: true,
    });
  });*/
}

exports.postDeleteProduct = (req, res, next) => {
  const {productId} = req.body;
  Product.deleteById(productId);
  res.redirect('/admin/products');
}
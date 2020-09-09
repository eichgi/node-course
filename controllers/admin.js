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

  req.user.createProduct({
    title,
    price,
    imageUrl,
    description,
  }).then(response => {
    console.log(response);
    res.redirect('/admin/products');
  }).catch(error => {
    console.log(error);
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect('/admin/products');
  }

  const {productId} = req.params;
  req.user.getProducts({where: {id: productId}})
    .then((products) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit product',
        path: '/admin/edit-product',
        editing: editMode,
        product: products[0],
      });
    }).catch(error => {
    console.log(error);
  });
};

exports.postEditProduct = (req, res, next) => {
  const {title, price, description, imageUrl, productId} = req.body;
  Product.findByPk(productId)
    .then(product => {
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(error => {
      console.log(error);
    });
  //const updatedProduct = new Product(productId, title, imageUrl, price, description);
  //updatedProduct.save();
}

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    }).catch(error => {
    console.log(error);
  });
}

exports.postDeleteProduct = (req, res, next) => {
  const {productId} = req.body;
  Product.destroy({where: {id: productId}})
    .then(response => {
      console.log(response);
      res.redirect('/admin/products');
    });
}
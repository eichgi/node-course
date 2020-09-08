const fs = require('fs');
const path = require('path');
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

module.exports = class Cart {

  constructor() {
    this.products = [];
    this.totalPrice = 0;
  }

  /**
   * Fetch the previous cart
   * Analyze the cart => Find existing product
   * Add new product / increase quantity
   * @param id
   */
  static addProduct(id, productPrice) {
    fs.readFile(p, (error, fileContent) => {
      let cart = {products: [], totalPrice: 0};

      if (!error) {
        cart = JSON.parse(fileContent);
      }

      const existingProductIndex = cart.products.findIndex(product => product.id === id);
      const existingProduct = cart.products[existingProductIndex];

      let updatedProduct;
      if (existingProduct) {
        updatedProduct = {...product, qty: product.qty + 1};
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = {id: id, qty: 1};
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(p, JSON.stringify(cart), error => {
        console.log(error);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (error, fileContent) => {
      if (error) {
        return;
      }

      const updatedCart = {...JSON.parse(fileContent)};
      console.log("UPDATED CART: ", updatedCart);
      const product = updatedCart.products.find(product => product.id === id);

      if (!product) {
        return;
      }

      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(product => product.id !== id);
      updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

      fs.writeFile(p, JSON.stringify(updatedCart), error => {
        console.log(error);
      });
    });
  }

  static getProducts(cb) {
    fs.readFile(p, (error, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (error) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
const mongodb = require('mongodb');
const getDb = require('./../util/database').getDb;

const ObjectId = mongodb.ObjectID;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; //{items: []}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({productId: ObjectId(product._id), quantity: newQuantity});
    }

    const updatedCart = {items: updatedCartItems};
    const db = getDb();
    return db.collection('users').updateOne({_id: ObjectId(this._id)}, {$set: {cart: updatedCart}});
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(item => {
      return item.productId;
    });

    return db.collection('products').find({_id: {$in: productIds}}).toArray()
      .then(products => {
        return products.map(product => {
          return {
            ...product,
            quantity: this.cart.items.find(item => {
              return item.productId.toString() === product._id.toString();
            }).quantity,
          }
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });

    const db = getDb();
    return db.collection('users')
      .updateOne(
        {_id: ObjectId(this._id)},
        {$set: {cart: {items: updatedCartItems}}}
      );
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: ObjectId(this._id),
            name: this.name
          }
        };

        return db.collection('orders').insertOne(order);
      })
      .then(order => {
        this.cart = {items: []};
        return db.collection('users')
          .updateOne(
            {_id: ObjectId(this._id)},
            {$set: {cart: {items: []}}}
          );
      }).catch(error => {
        console.log(error);
      });
  }

  getOrders() {
    const db = getDb();
    return db.collection('orders').find({'user._id': ObjectId(this._id)}).toArray();
  }

  static findById(userId) {
    const db = getDb();
    return db.collection('users').findOne({_id: ObjectId(userId)})
      .then(user => {
        return user;
      })
      .catch(error => {
        console.log(error);
      });
  }
}

module.exports = User;
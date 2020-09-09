const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(error => {
      console.log(error);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
Product.belongsToMany(Cart, {through: CartItem});
User.hasMany(Product);
User.hasOne(Cart);
User.hasMany(Order);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Order.belongsTo(User);
Order.belongsToMany(Product, {through: OrderItem});

sequelize
  .sync({force: false})
  .then(result => {
    return User.findByPk(1)
  })
  .then(user => {
    if (!user) {
      return User.create({name: 'Hiram', email: 'hiram@email.com'});
    }

    return user;
  })
  .then(user => {
    //console.log(user);
    return user.createCart();
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(error => {
    console.log(error);
  });
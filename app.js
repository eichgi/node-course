const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5f5bf7c7c2dbf908b721a15e')
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

mongoose.connect('mongodb+srv://react:react@cluster0.4mmt6.mongodb.net/node-course')
  .then(result => {
    User.findOne()
      .then(user => {
        if (!user) {
          const user = new User({
            name: 'Hiram',
            email: 'hiram@email.com',
            cart: {
              items: [],
            }
          });
          user.save();
        }
      })
    app.listen(3000);
  }).catch(error => {
  console.log(error);
});
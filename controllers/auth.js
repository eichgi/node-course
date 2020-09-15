const User = require('./../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  }
}));

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const {email, password, confirmPassword} = req.body;

  User.findOne({email})
    .then(userDoc => {
      if (userDoc) {
        req.flash('error', 'This email is already registered.');
        return res.redirect('/signup');
      }

      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: {items: []},
          });
          return user.save();
        })
        .then(response => {
          return transporter.sendMail({
            to: email,
            from: 'node@course.com',
            subject: 'Welcome to Node Course',
            html: '<h1>You successfully signed up!</h1>'
          });
        })
        .then(response => {
          console.log(response);
          res.redirect('/login');
        })
        .catch(error => {
          console.log(error);
        });
    })
    .catch(error => {
      console.log(error);
    });
};

exports.postLogin = (req, res, next) => {
  const {email, password} = req.body;

  User.findOne({email})
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/login');
      }

      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((error) => {
              console.log(error);
              res.redirect('/');
            });
          }

          req.flash('error', 'Invalid credentials');
          res.redirect('/login');
        })
        .catch(error => {
          console.log(error);
        });
    })
    .catch(error => {
      console.log(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    res.redirect('/login');
  });
};
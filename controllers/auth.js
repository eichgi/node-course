const User = require('./../models/user');
const {validationResult} = require('express-validator');
const crypto = require('crypto');
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
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
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
    oldInput: {
      email: '',
      password: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const {email, password, confirmPassword} = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {email, password, confirmPassword},
      validationErrors: errors.array(),
    });
  }

  bcrypt.hash(password, 12)
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
    .catch(err => {
      const error = new Error('Production creation failed.')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogin = (req, res, next) => {
  const {email, password} = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {email, password},
      validationErrors: errors.array(),
    });
  }

  User.findOne({email})
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          isAuthenticated: false,
          errorMessage: 'Invalid credentials',
          oldInput: {email, password},
          validationErrors: [],
        });
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

          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: false,
            errorMessage: 'Invalid credentials',
            oldInput: {email, password},
            validationErrors: [],
          });
        })
        .catch(error => {
          console.log(error);
        });
    })
    .catch(err => {
      const error = new Error('Production creation failed.')
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    res.redirect('/login');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  const {email} = req.body;
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');
    User.findOne({email})
      .then(user => {
        if (!user) {
          req.flash('error', 'No email found');
          return res.redirect('/reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(response => {
        res.redirect('/');
        transporter.sendMail({
          to: email,
          from: 'node@course.com',
          subject: 'Password Reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click the following link: <a href="http://localhost:3000/reset/${token}">Reset Password</a> to set a new password</p>
          `,
        });
      })
      .catch(err => {
        const error = new Error('Production creation failed.')
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const {token} = req.params;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
      let message = req.flash('error');

      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'Change Password',
        errorMessage: message,
        userId: user._id.toString(),
        token,
      });
    }).catch(error => {
    console.log(error);
  });
}

exports.postNewPassword = (req, res, next) => {
  const {password, userId, token} = req.body;
  let resetUser;

  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpiration: {$gt: Date.now()}
  })
    .then(user => {
      if (!user) {
        req.flash('error', 'The link has expired');
        res.redirect('/login');
      }
      resetUser = user;
      return bcrypt.hash(password, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(response => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error('Production creation failed.')
      error.httpStatusCode = 500;
      return next(error);
    });
}
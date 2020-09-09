const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-course', 'hiram', 'secret', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
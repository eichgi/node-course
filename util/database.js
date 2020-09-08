const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'hiram',
  password: 'secret',
  database: 'node-course',
  port: 3306,
});

module.exports = pool.promise();
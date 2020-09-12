const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://react:react@cluster0.4mmt6.mongodb.net/node-course')
    .then(client => {
      console.log("CONNECTED");
      _db = client.db();
      callback();
    })
    .catch(error => {
      console.log(error);
      throw error;
    });
}

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw 'No database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
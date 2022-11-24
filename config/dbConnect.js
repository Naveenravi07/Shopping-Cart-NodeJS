const mongoClient = require("mongodb").MongoClient;
require('dotenv').config()
const state = {
    db: null,
};

module.exports.connect = (done) => {
    const url = `mongodb://${process.env.DB_URL}:${process.env.DB_PORT}`;
    const dbname = 'ShastriCart';

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err);
        state.db = data.db(dbname);
        done();
    });
};

module.exports.get = () => {
    return state.db;
};
const mongoose = require('mongoose');
const config = require('config');

class MongoWrapper {
    static create() {
        const coonectionString = config.get('Mongo.connectionString');
        const driver = mongoose; 
        return new MongoWrapper(connectionString, driver);
    }

    constructor(connectionString, driver) {
        this._connectionString = connectionString;
        this._driver = driver;
    }

    connect() {
        return new Promise((resolve, reject) => {
            mongoose.connect(this._connectionString, {
                useMongoClient: true
            }, (error) => {
                if (error) reject(error);
                resolve();
            });
        });
    }
}

module.exports = MongoWrapper;
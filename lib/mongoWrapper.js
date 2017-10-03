const mongoose = require('mongoose');
const config = require('config');

class MongoWrapper {
    static create() {
        const connectionString = config.get('Mongo.connectionString');
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

    async dropDatabase() {
        await this._driver.connection.db.dropDatabase();
    }
}

module.exports = MongoWrapper;
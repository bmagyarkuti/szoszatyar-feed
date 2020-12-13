const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = Promise;

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

    async connect() {
        await this._driver.connect(this._connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    }

    async disconnect() {
      await this._driver.connection.close();
    }

    async dropDatabase() {
        await this._driver.connection.db.dropDatabase();
    }
}

module.exports = MongoWrapper;
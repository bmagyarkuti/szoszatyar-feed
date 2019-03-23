'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const mongoose = require('mongoose');
const config = require('config');

const Item = require('../../lib/models/item');
const MongoWrapper = require('../../lib/mongoWrapper');

describe('MongoWrapper', function() {
    describe('.connect', function() {
        it('successfully connects to existing database', async function() {
            let mongoWrapper = new MongoWrapper(config.get('Mongo.connectionString'), mongoose);
            
            return expect(mongoWrapper.connect()).to.be.fulfilled;
        });

        it('fails connecting to db on nonexistent port', async function() {
            let connectionString = "mongodb://mongo:91234/";
            let mongoWrapper = new MongoWrapper(connectionString, mongoose);
            
            return expect(mongoWrapper.connect()).to.be.rejectedWith('invalid port (larger than 65535) with hostname');
        });
    });

    describe('.dropDatabase', function() {
        let mongoWrapper;

        before(async function() {
            mongoWrapper = new MongoWrapper(config.get('Mongo.connectionString'), mongoose);
            
            await mongoWrapper.connect();
            const item = new Item({ name: 'example', size: 1});
            await item.save();
        });

        it('drops the database', async function() {
            await mongoWrapper.dropDatabase();

            expect(await Item.find().count()).to.eql(0);
        });
    })
});
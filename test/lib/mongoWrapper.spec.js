const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const MongoWrapper = require('../../lib/mongoWrapper');
const mongoose = require('mongoose');

describe('MongoWrapper', function() {
    describe('.connect', function() {
        it('successfully connects to existing database', async function() {
            let connectionString = "mongodb://localhost/test";
            let mongoWrapper = new MongoWrapper(connectionString, mongoose);
            
            return expect(mongoWrapper.connect()).to.be.fulfilled;
        })

        it('fails connecting to db on nonexistent port', async function() {
            let connectionString = "mongodb://localhost:91234/";
            let mongoWrapper = new MongoWrapper(connectionString, mongoose);
            
            return expect(mongoWrapper.connect()).to.be.rejectedWith('invalid port (larger than 65535) with hostname');
        })
    })
})
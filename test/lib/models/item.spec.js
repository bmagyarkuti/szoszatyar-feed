const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;

const Item = require('../../../lib/models/item');
const mongoWrapper = require('../../../lib/mongoWrapper').create();

describe('Item', function() {
    before(async function() {
        await mongoWrapper.connect();
    })
    beforeEach(async function() {
        await mongoWrapper.dropDatabase();
    });

    describe('.fetchOrDownloadSize', function() {        
        context('there is already a matching item in DB', function() {
            const itemInDb = new Item({
                name: 'http://www.example.com/ex.mp3',
                size: 111
            });
            
            beforeEach(async function() {
                await itemInDb.save();
            });
            
            it('fetches size from DB', async function() {
                expect(await Item.fetchOrDownloadSize(itemInDb.name)).to.eql(itemInDb.size);
            });            
        });
    })
});
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require('sinon');

const request = require('request-promise-native');

const Item = require('../../../lib/models/item');
const mongoWrapper = require('../../../lib/mongoWrapper').create();

describe('Item', function() {
    const item = {
        name: 'http://www.example.com/ex.mp3',
        size: 111
    };

    before(async function() {
        await mongoWrapper.connect();
    })
    beforeEach(async function() {
        await mongoWrapper.dropDatabase();
    });

    describe('.fetchOrDownloadSize', function() {        
        context('there is already a matching item in DB', function() {
            beforeEach(async function() {
                const itemInDb = new Item(item);
                await itemInDb.save();
            });
            
            it('returns correct size', async function() {
                expect(await Item.fetchOrDownloadSize(item.name)).to.eql(item.size);
            });            
        });

        context('there is no matching item in DB', function() {
            before(function() {
                sinon.stub(request, 'head').withArgs(item.name).returns({
                    'content-length': item.size
                });
            });

            after(function() {
                request.head.restore();
            })

            it('returns correct size', async function() {
                expect(await Item.fetchOrDownloadSize(item.name)).to.eql(item.size)    
            });

            it('saves data in db', async function() {
                await Item.fetchOrDownloadSize(item.name);

                const result = await Item.find({name: item.name}); 
                
                expect(result.length).to.eql(1);
                expect(result[0].name).to.eql(item.name);
                expect(result[0].size).to.eql(item.size);
            })
        })
    })
});
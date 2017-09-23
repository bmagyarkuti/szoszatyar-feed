const expect = require('chai').expect;
const request = require('supertest');

const server = require('../../app/web.js');

describe('/api/feed.xml', function() {
    let response;
    
    before(async function() {
         response = await request(server.listen()).get('/feed.rss');  
    });

    it('returns 200 OK', function() {
        expect(response.status).to.equal(200);
        expect(response.text).to.equal('OK');
    });
})

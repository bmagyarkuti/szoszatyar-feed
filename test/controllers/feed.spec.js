'use strict';

const expect = require('chai').expect;
const request = require('supertest');

const server = require('../../app/web.js');

describe('/api/feed.xml', function() {
    let response;
    
    before(async function() {
         response = await request(server.listen()).get('/feed.rss');  
    });

    it('returns 200', function() {
        expect(response.status).to.equal(200);
    });

    it('returns with content-type xml', function() {
        expect(response.header['content-type']).to.equal('application/xml');
    });
    
    it('responds with empty xml and rss', function() {
        expect(response.text).to.equal(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:rawvoice="http://www.rawvoice.com/rawvoiceRssModule/" version="2.0">' +
        '</rss>'
        );
    });
})

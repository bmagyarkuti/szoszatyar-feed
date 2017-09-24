'use strict';

const expect = require('chai').expect;
const request = require('supertest');
const { parseString } = require('xml2js');
const config = require('config');

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
    
    describe('parsed xml body', function() {
        before(function () {
            response.parsed = {};
            parseString(response.text, (err, result) => {
                Object.assign(response.parsed, result);
            });
        });

        it('has rss header', function() {
            expect(response.parsed.rss.$).to.deep.equal({
                'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
                'xmlns:atom': 'http://www.w3.org/2005/Atom',
                'xmlns:rawvoice': 'http://www.rawvoice.com/rawvoiceRssModule/',
                version: '2.0'
            });
        });

        let hasSimpleTag = function(tagName) {
            expect(response.parsed.rss.channel[0][tagName][0]).to.eql(
                config.get(tagName)
            );
        };

        ['title', 'description', 'link', 'language'].forEach((tagName) => {
            it(`has ${tagName} tag in channel`, hasSimpleTag.bind(this, tagName));            
        })
    });
})

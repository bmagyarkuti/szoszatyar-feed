'use strict';

const expect = require('chai').expect;
const request = require('supertest');
const { parseString } = require('xml2js');

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

        it('has title tag in channel', function() {
            expect(response.parsed.rss.channel[0].title[0]).to.eql(
                'Szószátyár-archívum'
            );
        });

        it('has link tag in channel', function() {
            expect(response.parsed.rss.channel[0].link[0]).to.eql(
                'http://www.budling.hu/~kalman/arch/popular/szoszatyar'
            );
        });

        it('has description tag in channel', function() {
            expect(response.parsed.rss.channel[0].description[0]).to.eql(
                'A Klubrádió "Szószátyár" c. műsorának archívuma.' + 
                'Figyelem, ez nemhivatalos adapter, melynek célja, hogy iTunesból' + 
                'és más hasonló programokból is követhetővé váljon a műsor.' +
                'A szerzői jogokat az eredeti tulajdonosok gyakorolják.'
            );
        });
    });
})

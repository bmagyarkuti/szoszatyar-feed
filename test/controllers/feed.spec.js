'use strict';

const expect = require('chai').expect;
const request = require('supertest');
const { parseString } = require('xml2js');
const config = require('config');
const sinon = require('sinon');
const { Readable } = require('stream');
const XmlResourceStream = require('../../lib/xml-resource-stream.js');

const server = require('../../app/web.js');

describe('/feed.xml', function() {
    let response;
    const item1 = {
        title: '2016. december 7.',
        link: 'http://www.budling.hu/~kalman/szoszatyar/20161207.mp3',
        description: 'valami?'
    };
    const item2 = {
        title: '2016. december 14.',
        link: 'http://www.budling.hu/~kalman/szoszatyar/20161214.mp3',
        description: 'megvalami?'
    };
    
    const fakeXmlResourceStream = new Readable({
        objectMode: true,
        read(size) {
            [item1, item2].forEach(item => this.push(item));
            this.push(null);
        }
    });

    before(async function() {
         sinon.stub(XmlResourceStream, 'create').returns(fakeXmlResourceStream);
         response = await request(server.listen()).get('/feed.rss');  
    });

    after(() => {
        XmlResourceStream.create.restore();
    })

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

        const hasSimpleTag = function(tagName) {
            expect(response.parsed.rss.channel[0][tagName][0]).to.eql(
                config.get(tagName)
            );
        };

        ['title', 'description', 'link', 'language', 'itunes:explicit'].forEach((tagName) => {
            it(`has ${tagName} tag in channel`, hasSimpleTag.bind(this, tagName));            
        })

        it('has itunes:category tag in channel', function() {
            expect(response.parsed.rss.channel[0]['itunes:category'][0].$.text).to.eql(
                config.get('itunes:category')
            );
        });

        it('has first title tag in channel', function() {
            expect(response.parsed.rss.channel[0].item[0].title[0]).to.eql(item1.title);
        });
    });
})

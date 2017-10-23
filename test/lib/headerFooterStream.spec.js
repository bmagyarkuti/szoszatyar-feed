'use strict';

const config = require('config');
const expect = require('chai').expect;
const { parseString } = require('xml2js');
const { Readable } = require('stream');
const toString = require('stream-to-string');
const sinon = require('sinon');

const HeaderFooterStream = require('../../lib/headerFooterStream');
const Item = require('../../lib/models/item');

describe('HeaderFooterStream', function() {
    const currentTime = 'Sat, 18 Feb 2017 12:33:36 GMT';
    const inputStream = new Readable({
        objectMode: false,
        read(size) {
            this.push('helo');
            this.push(null);
        }
    });

    let parsedResult = {};

    before(async function() {
        sinon.stub(Item, 'fetchLastBuildDate').resolves(currentTime);
        let rawStreamOutput = await toString(inputStream.pipe(HeaderFooterStream.create()));
        parseString(rawStreamOutput, (err, result) => {
            if (err) { throw err; }
            Object.assign(parsedResult, result);
        });
    });

    after(function() {
        Item.fetchLastBuildDate.restore();
    });

    it('writes rss header', function() {
        expect(parsedResult.rss.$).to.deep.equal({
            'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
            'xmlns:atom': 'http://www.w3.org/2005/Atom',
            'xmlns:rawvoice': 'http://www.rawvoice.com/rawvoiceRssModule/',
            version: '2.0'
        });
    });

    const hasSimpleTag = function(tagName) {
        expect(parsedResult.rss.channel[0][tagName][0]).to.eql(
            config.get(tagName)
        );
    };

    ['title', 'description', 'link', 'language', 'itunes:explicit'].forEach((tagName) => {
        it(`writes ${tagName} tag to channel`, hasSimpleTag.bind(this, tagName));
    });

    it('writes itunes:category tag to channel', function() {
        expect(parsedResult.rss.channel[0]['itunes:category'][0].$.text).to.eql(
            config.get('itunes:category')
        );
    });

    it('writes title tag to image', function() {
        expect(parsedResult.rss.channel[0].image[0].title[0]).to.eql(config.get('image.title'));
    });

    it('writes link tag to image', function() {
        expect(parsedResult.rss.channel[0].image[0].link[0]).to.eql(config.get('image.link'));
    });

    it('writes url tag to image', function() {
        expect(parsedResult.rss.channel[0].image[0].url[0]).to.eql(config.get('image.url'));
    });

    it('writes lastBuildDate tag to channel', function() {
        expect(parsedResult.rss.channel[0].lastBuildDate[0]).to.eql(currentTime)
    })
});
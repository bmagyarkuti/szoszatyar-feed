'use strict';

const config = require('config');
const expect = require('chai').expect;
const { parseString } = require('xml2js');
const { Readable } = require('stream');
const sinon = require('sinon');
const toString = require('stream-to-string');
const request = require('request-promise-native');

const PipeCreator = require('../../lib/pipeCreator');

describe('PodcastTransformStream', function() {
    const item1 = {
        title: '2016. december 7.',
        link: 'http://www.budling.hu/~kalman/szoszatyar/20161207.mp3',
        description: 'valami?',
        head: {
            'content-length': '100',
            'last-modified': 'Sat, 18 Feb 2017 12:33:36 GMT'
        }
    };
    const item2 = {
        title: '2016. december 14.',
        link: 'http://www.budling.hu/~kalman/szoszatyar/20161214.mp3',
        description: 'megvalami?',
        head: {
            'content-length': '200',
            'last-modified': 'Sun, 15 Oct 2017 10:27:23 GMT'
        }
    };
    
    const inputStream = new Readable({
        objectMode: true,
        read(size) {
            [item1, item2].forEach(item => this.push(item));
            this.push(null);
        }
    });
    
    let parsedResult = {};
    before(async function() {
        sinon.stub(request, 'head').callsFake(url => {
            let fakes = {
                [item1.link]: item1.head,
                [item2.link]: item2.head
            };
            return fakes[url];
        });
        
        let rawStreamOutput = await toString(PipeCreator.create(inputStream));
        parseString(rawStreamOutput, (err, result) => {
            if (err) { throw err; }
            Object.assign(parsedResult, result);
        });
    });

    after(function() {
        request.head.restore();
    });

    it('writes rss header', function() {
        expect(parsedResult.rss.$).to.deep.equal({
            'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
            'xmlns:atom': 'http://www.w3.org/2005/Atom',
            'xmlns:rawvoice': 'http://www.rawvoice.com/rawvoiceRssModule/',
            version: '2.0'
        });
    });

    it('writes title tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].title[0]).to.eql(item1.title);
    });

    it('writes link tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].link[0]).to.eql(item1.link);        
    });

    it('writes guid tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].guid[0]).to.eql(item1.link);        
    });

    it('writes description tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].description[0]).to.eql(
            item1.description
        );        
    });

    it('writes enclosure tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].enclosure[0].$).to.eql(
            {
                url: item1.link,
                type: config.get('enclosure.type'),
                length: item1.head['content-length']
            }
        );        
    });

    it('writes pubDate tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].pubDate[0]).to.eql(
            item1.head['last-modified']
        );
    });

    it('writes title tag to second item in channel', function() {
        expect(parsedResult.rss.channel[0].item[1].title[0]).to.eql(item2.title);
    });
});
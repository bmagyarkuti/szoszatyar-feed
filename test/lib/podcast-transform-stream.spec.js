'use strict';

const config = require('config');
const expect = require('chai').expect;
const { parseString } = require('xml2js');
const { Readable } = require('stream');
const sinon = require('sinon');
const toString = require('stream-to-string');
const request = require('request-promise-native');

const PodcastTransformStream = require('../../lib/podcast-transform-stream.js');

describe('PodcastTransformStream', function() {
    const item1 = {
        title: '2016. december 7.',
        link: 'http://www.budling.hu/~kalman/szoszatyar/20161207.mp3',
        description: 'valami?',
        length: '100'
    };
    const item2 = {
        title: '2016. december 14.',
        link: 'http://www.budling.hu/~kalman/szoszatyar/20161214.mp3',
        description: 'megvalami?',
        length: '200'
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
            let fakes = {};
            fakes[item1.link] = item1.length;
            fakes[item2.link] = item2.length;
            return { "content-length": fakes[url] };
        });
        
        const podcastTransformStream = inputStream.pipe(PodcastTransformStream.create());    
        let rawStreamOutput = await toString(podcastTransformStream);
        parseString(rawStreamOutput, (err, result) => {
            Object.assign(parsedResult, result);
        });
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
    })

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

    it('writes title tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].title[0]).to.eql(item1.title);
    });

    it('writes link tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].link[0]).to.eql(item1.link);        
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
                length: item1.length
            }
        );        
    })

    it('writes title tag to second item in channel', function() {
        expect(parsedResult.rss.channel[0].item[1].title[0]).to.eql(item2.title);
    });
});
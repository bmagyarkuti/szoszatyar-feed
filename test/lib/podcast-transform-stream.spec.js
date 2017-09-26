'use strict';

'use strict';

const config = require('config');
const expect = require('chai').expect;
const { parseString } = require('xml2js');
const { Readable } = require('stream');
const toString = require('stream-to-string');

const PodcastTransformStream = require('../../lib/podcast-transform-stream.js');

describe('PodcastTransformStream', function() {
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
    
    const inputStream = new Readable({
        objectMode: true,
        read(size) {
            [item1, item2].forEach(item => this.push(item));
            this.push(null);
        }
    });

    const podcastTransformStream = inputStream.pipe(PodcastTransformStream.create());
    
    let parsedResult;
    
    before(async function() {
        let rawStreamOutput = await toString(podcastTransformStream);
        parsedResult = {}
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

    it('writes title tag to first item in channel', function() {
        expect(parsedResult.rss.channel[0].item[0].title[0]).to.eql(item1.title);
    });

    it('writes title tag to second item in channel', function() {
        expect(parsedResult.rss.channel[0].item[1].title[0]).to.eql(item2.title);
    });
});
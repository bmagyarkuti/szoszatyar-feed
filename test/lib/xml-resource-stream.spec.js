const request = require('request');
const sinon = require('sinon');
const { Readable } = require('stream');
const { expect } = require('chai');

const XmlResourceStream = require('../../lib/xml-resource-stream.js');

const fakeRawInputStream = () => {
    const fakeInputIterator = [
        '<rss version="2.0">',
            '<channel>',
                '<title>TITLE</title>',
                '<link>',
                    'http://www.budling.hu/~kalman/arch/',
                '</link>',
                '<description>A "Szószátyár" c. műsor.</description>',
                '<item>',
                    '<title>2016. december 7.</title>',
                    '<link>',
                        'http://www.budling.hu/~kalman/szoszatyar/20161207.mp3',
                    '</link>',
                    '<description>valami?</description>',
                '</item>',
                '<item>',
                    '<title>2016. december 14.</title>',
                    '<link>',
                        'http://www.budling.hu/~kalman/szoszatyar/20161214.mp3',
                    '</link>',
                    '<description>megvalami?</description>',
                '</item>',
            '</channel>',
        '</rss>'
    ].entries();

    return new Readable({        
        read(size) {
            while(true) {
                let result = fakeInputIterator.next();
                let canContinue = result.done ? this.push(null) : this.push(result.value[1])
                if (!canContinue || result.done) {
                    break
                };                
            } 
        },
        highWaterMark: 2
    });
}

const streamToArray = (stream) => {
    const result = [];
    return new Promise((resolve, reject) => {
        stream.on('data', data => result.push(data));
        stream.on('end', () => resolve(result));
        stream.on('error', reject);
    });
};

describe('Readable stream of specific resource indentifiers', function() {
    const url = 'some_url';
    const selector = 'endElement: channel > item';
    let resultArray;
    
    beforeEach(async function() {
        sinon.stub(request, 'get').returns(fakeRawInputStream());
        resultArray = await streamToArray(new XmlResourceStream({ url, selector }));        
    });

    afterEach(function() {
        request.get.restore();
    })

    it('returns the right number of items', function() {
        expect(resultArray.length).to.eql(2);
    })

    it('returns first item', function() {
        expect(resultArray[0]).to.deep.equal({
            title: '2016. december 7.',
            link: 'http://www.budling.hu/~kalman/szoszatyar/20161207.mp3',
            description: 'valami?'
        });
    })

    it('returns second item', function() {
        expect(resultArray[1]).to.deep.equal({
            title: '2016. december 14.',
            link: 'http://www.budling.hu/~kalman/szoszatyar/20161214.mp3',
            description: 'megvalami?'
        });
    })
})
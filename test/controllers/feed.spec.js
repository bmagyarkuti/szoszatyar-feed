'use strict';

const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');
const { Readable } = require('stream');
const XmlResourceStream = require('../../lib/xml-resource-stream.js');
const PodcastTransformStream = require('../../lib/podcast-transform-stream.js');
const server = require('../../app/web.js');

describe('/feed.xml', function() {
    const expectedResponseText = '<?xml version="1.0" encoding="UTF-8"?><example>Some Example</example>';
    
    let response;
    before(async function() {
        let fakeTransformStream = new Readable({
            read(size) {
                this.push(expectedResponseText);
                this.push(null);
            }
        });
        let fakePodcastTransformStream = 'fakePodcastTransformStream';
        let inputStreamStub = {
            pipe: sinon.stub()
                .withArgs(fakePodcastTransformStream)
                .returns(fakeTransformStream)
        }
        sinon.stub(XmlResourceStream, 'create').withArgs({
             url: 'http://budling.hu/~kalman/arch/popular/szoszatyar/rss.xml',
            selector: 'endElement: channel > item'
        }).returns(inputStreamStub);
        sinon.stub(PodcastTransformStream, 'create')
            .returns(fakePodcastTransformStream);
        
        response = await request(server.listen()).get('/feed.rss');  
    });

    after(function() {
        XmlResourceStream.create.restore();
        PodcastTransformStream.create.restore();
    });

    it('returns 200', function() {
        expect(response.status).to.equal(200);
    });

    it('returns with content-type xml', function() {
        expect(response.header['content-type']).to.equal('application/xml');
    });
    
    it('writes stream output to response', function() {
        expect(response.text).to.eql(expectedResponseText);
    });
});

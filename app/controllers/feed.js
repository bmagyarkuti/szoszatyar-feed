'use strict';

const request = require('request');

const XmlResourceStream = require('../../lib/xml-resource-stream.js');
const PodcastTransformStream = require('../../lib/podcast-transform-stream.js');

module.exports = async function(context) {
    const inputStream = XmlResourceStream.create({
        url: 'http://budling.hu/~kalman/arch/popular/szoszatyar/rss.xml',
        selector: 'endElement: channel > item'
    });
    const podcastTransformStream = new PodcastTransformStream();

    context.type = 'application/xml';
    context.body = inputStream.pipe(podcastTransformStream);
    context.status = 200;
}

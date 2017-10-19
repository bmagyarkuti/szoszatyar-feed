'use strict';

const config = require('config');
const request = require('request');

const XmlResourceStream = require('../../lib/xml-resource-stream.js');
const PodcastTransformStream = require('../../lib/podcast-transform-stream.js');

module.exports = async function(context) {
    const inputStream = XmlResourceStream.create({
        url: config.get('originalFeedUrl'),
        selector: 'endElement: channel > item'
    });
    const podcastTransformStream = PodcastTransformStream.create();

    context.type = 'application/xml';
    context.body = inputStream.pipe(podcastTransformStream);
    context.status = 200;
}

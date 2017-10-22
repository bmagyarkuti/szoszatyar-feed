'use strict';

const config = require('config');
const request = require('request');

const XmlResourceStream = require('../../lib/xml-resource-stream.js');
const PipeCreator = require('../../lib/pipeCreator');

module.exports = async function(context) {
    const inputStream = XmlResourceStream.create({
        url: config.get('originalFeedUrl'),
        selector: 'endElement: channel > item'
    });

    context.type = 'application/xml';
    context.body = PipeCreator.create(inputStream);
    context.status = 200;
}

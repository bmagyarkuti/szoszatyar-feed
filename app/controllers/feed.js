'use strict';

const config = require('config');
const request = require('request');

const XmlResourceStream = require('../../lib/xml-resource-stream.js');
const ItemStream = require('../../lib/itemStream');

module.exports = async function(context) {
    const inputStream = XmlResourceStream.create({
        url: config.get('originalFeedUrl'),
        selector: 'endElement: channel > item'
    });
    const itemStream = ItemStream.create();

    context.type = 'application/xml';
    context.body = inputStream.pipe(itemStream);
    context.status = 200;
}

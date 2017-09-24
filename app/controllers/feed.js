'use strict';

const XmlWriter = require('xml-writer');
const request = require('request');
const { PassThrough } = require('stream');

const getResultStream = () => {
    const passThrough = new PassThrough();
    const xmlWriter = new XmlWriter(false, function(string, encoding) {
        passThrough.write(string, encoding);
    });
    xmlWriter.startDocument('1.0', 'UTF-8');
    passThrough.end();
    return passThrough;
} 

module.exports = async function(context) {
    context.type = 'application/xml';
    context.body = getResultStream();
    context.status = 200;
}

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
    xmlWriter.startElement('rss');
    xmlWriter.writeAttribute('xmlns:itunes', 'http://www.itunes.com/dtds/podcast-1.0.dtd');
    xmlWriter.writeAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom');
    xmlWriter.writeAttribute('xmlns:rawvoice', 'http://www.rawvoice.com/rawvoiceRssModule/');
    xmlWriter.writeAttribute('version', '2.0');
    xmlWriter.startElement('channel');
    xmlWriter.startElement('title').text('Szószátyár-archívum');

    xmlWriter.endDocument();
    xmlWriter.toString();
    passThrough.end();
    return passThrough;
} 

module.exports = async function(context) {
    context.type = 'application/xml';
    context.body = getResultStream();
    context.status = 200;
}

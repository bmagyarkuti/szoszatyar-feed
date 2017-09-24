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
    let rss = xmlWriter.startElement('rss');
    rss.writeAttribute('xmlns:itunes', 'http://www.itunes.com/dtds/podcast-1.0.dtd');
    rss.writeAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom');
    rss.writeAttribute('xmlns:rawvoice', 'http://www.rawvoice.com/rawvoiceRssModule/');
    rss.writeAttribute('version', '2.0');
    let channel = rss.startElement('channel');
    channel.startElement('title').text('Szószátyár-archívum').endElement();
    channel.startElement('link').text('http://www.budling.hu/~kalman/arch/popular/szoszatyar').endElement();
    channel.endElement();
    rss.endElement();
    xmlWriter.endDocument();
    
    passThrough.end();
    return passThrough;
} 

module.exports = async function(context) {
    context.type = 'application/xml';
    context.body = getResultStream();
    context.status = 200;
}

'use strict';

const XmlWriter = require('xml-writer');
const request = require('request');
const { PassThrough } = require('stream');
const config = require('config');

const _getResultStream = () => {
    const passThrough = new PassThrough();
    const xmlWriter = new XmlWriter(false, function(string, encoding) {
        passThrough.write(string, encoding);
    });
    
    _write(xmlWriter);
    
    passThrough.end();
    return passThrough;
}

const _write = writer => {
    writer.startDocument('1.0', 'UTF-8');
    _writeRss(writer);
    writer.endDocument();
}

const _writeRss = writer => {
    let rss = _writeRssHeader(writer);
    _writeChannel(rss);
    rss.endElement();
}

const _writeRssHeader = writer => writer
        .startElement('rss')
        .writeAttribute('xmlns:itunes', 'http://www.itunes.com/dtds/podcast-1.0.dtd')
        .writeAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom')
        .writeAttribute('xmlns:rawvoice', 'http://www.rawvoice.com/rawvoiceRssModule/')
        .writeAttribute('version', '2.0');

const _writeChannel = writer => {
    const channel = writer.startElement('channel');
    ['title', 'description', 'link', 'language', 'itunes:explicit'].forEach(tag => {
        writeSimpleTag(tag, channel)
    });
    channel.startElement('itunes:category').writeAttribute('text', config.get('itunes:category')).endElement();
    channel.endElement();
}

const writeSimpleTag = (tag, writer) => writer.startElement(tag).text(config.get(tag)).endElement();

module.exports = async function(context) {
    context.type = 'application/xml';
    context.body = _getResultStream();
    context.status = 200;
}

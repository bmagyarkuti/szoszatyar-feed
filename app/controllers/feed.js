'use strict';

const XmlWriter = require('xml-writer');
const request = require('request');
const { Transform } = require('stream');
const config = require('config');

const XmlResourceStream = require('../../lib/xml-resource-stream.js');

class TransformStream extends Transform {
    constructor(options = {}) {
        super(Object.assign(options, {
            readableObjectMode: false,
            writableObjectMode: true
        }));
        this._isFirst = true;
        this._xmlWriter = new XmlWriter(false, (string, encoding) => {
            this.push(string);
        });
    }

    // @todo: handle backpressure
    _transform(chunk, encoding, callback) {
        if (this._isFirst) {
            this._startDocument(this._xmlWriter);
            this._isFirst = false;
        }
        this._writeItem(chunk);
        callback();
    }

    _flush(callback) {
        this._endDocument();
        this.push(null);
        callback();
    }

     _startDocument(writer) {
        writer.startDocument('1.0', 'UTF-8');
        this._startRss(writer);
    }
    
    _startRss(writer) {
        this._rss = this._writeRssHeader(writer);
        this._startChannel(this._rss);
    }
    
    _writeRssHeader(writer) {
        return writer.startElement('rss')
            .writeAttribute('xmlns:itunes', 'http://www.itunes.com/dtds/podcast-1.0.dtd')
            .writeAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom')
            .writeAttribute('xmlns:rawvoice', 'http://www.rawvoice.com/rawvoiceRssModule/')
            .writeAttribute('version', '2.0');
    }
        
    _startChannel(writer) {
        this._channel = writer.startElement('channel');
        ['title', 'description', 'link', 'language', 'itunes:explicit'].forEach(tag => {
            this._writeSimpleTag(tag, this._channel)
        });
        this._channel.startElement('itunes:category').writeAttribute('text', config.get('itunes:category')).endElement();
    }
    
    _writeSimpleTag(tag, writer) {
        writer.startElement(tag).text(config.get(tag)).endElement();    
    } 

    _endDocument() {
        this._channel.endElement();
        this._rss.endElement();
        this._xmlWriter.endDocument();
    }

    _writeItem(chunk) {
        const item = this._xmlWriter.startElement('item');
        item.startElement('title').text(chunk.title).endElement();
        item.endElement();
    }
}


module.exports = async function(context) {
    const inputStream = XmlResourceStream.create({
        url: 'http://budling.hu/~kalman/arch/popular/szoszatyar/rss.xml',
        selector: 'endElement: channel > item'
    });
    const transformStream = new TransformStream();

    context.type = 'application/xml';
    context.body = inputStream.pipe(transformStream);
    context.status = 200;
}

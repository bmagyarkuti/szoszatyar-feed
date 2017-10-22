'use strict';

const { Transform } = require('stream');
const XmlWriter = require('xml-writer');
const config = require('config');

class HeaderFooterStream extends Transform {
    static create(options = {}) {
        options = Object.assign(options, {
            readableObjectMode: false,
            writableObjectMode: true
        });
        return new HeaderFooterStream(options);
    }
    
    constructor(options) {
        super(options);
        this._isFirst = true;
        this._piped = true;
        this._xmlWriter = new XmlWriter(false, (string, encoding) => {
            this._piped && this.push(string);
        });
        this.on('unpipe', () => {
            this._piped = false;
        })
        this.on('pipe', () => {
            this._piped = true;
        });
    }

    async _transform(chunk, encoding, callback) {
        if (this._isFirst) {
            this._startDocument(this._xmlWriter);
            this._isFirst = false;
        }
        this._piped && this.push(chunk);
        callback();
    }

    _flush(callback) {
        if (this._isFirst) return;
        this._endDocument();
        this._piped && this.push(null);
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
        this._writeImage(this._channel);
    }
    
    _writeSimpleTag(tag, writer) {
        writer.startElement(tag).text(config.get(tag)).endElement();    
    }
    
    _writeImage(writer) {
        let image = writer.startElement('image');
        image.startElement('title').text(config.get('image.title')).endElement();
        image.startElement('link').text(config.get('image.link')).endElement();
        image.startElement('url').text(config.get('image.url')).endElement();
        image.endElement();
    }

    _endDocument() {
        this._channel.endElement();
        this._rss.endElement();
        this._xmlWriter.endDocument();
    }
}

module.exports = HeaderFooterStream
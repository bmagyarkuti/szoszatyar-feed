'use strict';

const { Transform } = require('stream');
const XmlWriter = require('xml-writer');
const config = require('config');

const Item = require('./models/item');

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
        this._xmlWriter = new XmlWriter(false, (string) => {
            this.push(string);
        });
    }

    async _transform(chunk, encoding, callback) {
        if (this._isFirst) {
            await this._startDocument(this._xmlWriter);
            this._isFirst = false;
        }
        this.push(chunk);
        callback();
    }

    _flush(callback) {
        if (this._isFirst) return;
        this._endDocument();
        this.push(null);
        callback();
    }

    async _startDocument(writer) {
        writer.startDocument('1.0', 'UTF-8');
        await this._startRss(writer);
    }
    
    async _startRss(writer) {
        this._rss = HeaderFooterStream._writeRssHeader(writer);
        await this._startChannel(this._rss);
    }
    
    static _writeRssHeader(writer) {
        return writer.startElement('rss')
            .writeAttribute('xmlns:itunes', 'http://www.itunes.com/dtds/podcast-1.0.dtd')
            .writeAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom')
            .writeAttribute('xmlns:rawvoice', 'http://www.rawvoice.com/rawvoiceRssModule/')
            .writeAttribute('version', '2.0');
    }
        
    async _startChannel(writer) {
        this._channel = writer.startElement('channel');
        ['title', 'description', 'link', 'language', 'itunes:explicit'].forEach(tag => {
            HeaderFooterStream._writeSimpleTag(tag, this._channel)
        });
        this._channel.startElement('itunes:category').writeAttribute('text', config.get('itunes:category')).endElement();
        HeaderFooterStream._writeImage(this._channel);
        this._channel.startElement('lastBuildDate').text(await Item.fetchLastBuildDate()).endElement();
    }
    
    static _writeSimpleTag(tag, writer) {
        writer.startElement(tag).text(config.get(tag)).endElement();    
    }
    
    static _writeImage(writer) {
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

module.exports = HeaderFooterStream;
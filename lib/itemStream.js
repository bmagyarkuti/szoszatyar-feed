'use strict';

const { Transform } = require('stream');
const XmlWriter = require('xml-writer');
const config = require('config');
const request = require('request-promise-native');

class ItemStream extends Transform {
    static create(options = {}) {
        options = Object.assign(options, {
            readableObjectMode: false,
            writableObjectMode: true
        });
        return new ItemStream(options);
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

    _transform(chunk, encoding, callback) {
        this._writeItem(chunk);
        callback();
    }

    _writeItem(chunk) {
        const item = this._xmlWriter.startElement('item');
        item.startElement('title').text(chunk.title).endElement();
        item.startElement('link').text(chunk.link).endElement();
        item.startElement('guid').text(chunk.link).endElement();
        item.startElement('description').text(chunk.description).endElement();
        item.startElement('enclosure')
            .writeAttribute('url', chunk.link)
            .writeAttribute('type', config.get('enclosure.type'))
            .writeAttribute('length', chunk.length)
            .endElement();
        item.startElement('pubDate')
            .text(chunk.pubDate)
            .endElement();
        item.endElement();
    }
}

module.exports = ItemStream
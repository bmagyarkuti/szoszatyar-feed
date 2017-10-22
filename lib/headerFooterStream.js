'use strict';

const { Transform } = require('stream');

class HeaderFooterStream extends Transform {
    static create(options = {}) {
        options = Object.assign(options, {
            readableObjectMode: false,
            writableObjectMode: false
        });
        return new HeaderFooterStream(options);
    }
    
    async _transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
    }

    async _flush(callback) {
        callback();
    }
}

module.exports = HeaderFooterStream
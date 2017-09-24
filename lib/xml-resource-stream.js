const { Readable } = require('stream');
const request = require('request');
const XmlStream = require('xml-stream');

const overrideOptions = {
    objectMode: true,
};

const defaultOptions = {
    highWaterMark: 10    
}

class XmlResourceStream extends Readable {
    static create(options) {
        return new XmlResourceStream(
            Object.assign(defaultOptions, options, overrideOptions)
        );
    }

    constructor(options) {
        super(options);
        
        this._xmlInputStream = new XmlStream(request.get(options.url));
        this._paused = false;

        this._xmlInputStream.on(options.selector, this._pushElement.bind(this));
        this._xmlInputStream.on('end', this._endStream.bind(this));
        this._xmlInputStream.on('error', console.log);
    }

    _read(size) {
        if (this._paused) {
            this._xmlInputStream.resume();
        }
    }

    _pushElement(elem) {
        if (!this.push(elem)){
            this._xmlInputStream.pause();
            this._paused = true;
        };
    }

    _endStream() {
        this.push(null);
    }
}

module.exports = XmlResourceStream

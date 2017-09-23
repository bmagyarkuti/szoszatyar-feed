const { Readable } = require('stream');
const request = require('request');
const XmlStream = require('xml-stream');

class XmlResourceStream extends Readable {
    constructor(options = {}) {
        super(Object.assign(options, {
            objectMode: true,
            highWaterMark: 10
        }));
        const rawInputStream = request.get(options.url);        
        this._xmlInputStream = new XmlStream(rawInputStream);
        this._paused = false;
        this._xmlInputStream.on(options.selector, elem => {
            if (!this.push(elem)){
                this._xmlInputStream.pause();
                this._paused = true;
            };
        });
        this._xmlInputStream.on('end', () => {
            this.push(null);
        })
        this._xmlInputStream.on('error', console.log);
    }

    _read(size) {
        if (this._paused) {
            this._xmlInputStream.resume();
        }
    }
}

if (module.parent) {
    module.exports = XmlResourceStream    
} else {
    const stream = new XmlResourceStream();
    stream.on('data', console.log);
    stream.on('error', console.log);
}
const { Transform } = require('stream');

const Item = require('./models/item');

class PropertyFetcherStream extends Transform {
    constructor(fetchAction) {
        super({
            readableObjectMode: true,
            writableObjectMode: true
        });
        this._fetchAction = fetchAction
    }

    async _transform(chunk, encoding, callback) {
        await this._fetchAction(chunk);
        this.push(chunk);
        callback();  
    }
}

module.exports = PropertyFetcherStream
'use strict';

const ItemStream = require('./itemStream');
const HeaderFooterStream = require('./headerFooterStream');
const PropertyFetcherStream = require('./propertyFetcherStream');

const Item = require('./models/item');

class PipeCreator {
    static create(inputStream) {
        return inputStream
            .pipe(new PropertyFetcherStream(PipeCreator._fetchLength))
            .pipe(new PropertyFetcherStream(PipeCreator._fetchPubDate))
            .pipe(ItemStream.create())
            .pipe(HeaderFooterStream.create());
    }
    
    static async _fetchLength(chunk) {
        chunk.length = await Item.fetchOrDownloadSize(chunk.link);
    }

    static async _fetchPubDate(chunk) {
        chunk.pubDate = await Item.fetchOrDownloadPubDate(chunk.link);
    }
}
    
module.exports = PipeCreator
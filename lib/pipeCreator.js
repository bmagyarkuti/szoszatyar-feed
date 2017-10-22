'use strict';

const ItemStream = require('./itemStream');
const HeaderFooterStream = require('./headerFooterStream');
const PropertyFetcherStream = require('./propertyFetcherStream');

const Item = require('./models/item');

const fetchLength = async chunk => chunk.length = await Item.fetchOrDownloadSize(chunk.link);
const fetchPubDate = async chunk => chunk.pubDate = await Item.fetchOrDownloadPubDate(chunk.link);

class PipeCreator {
    static create(inputStream) {
        return inputStream
            .pipe(new PropertyFetcherStream(fetchLength))
            .pipe(new PropertyFetcherStream(fetchPubDate))
            .pipe(ItemStream.create())
            .pipe(HeaderFooterStream.create());
    }    
}
    
module.exports = PipeCreator
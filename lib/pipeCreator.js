'use strict';

const ItemStream = require('./itemStream');
const HeaderFooterStream = require('./headerFooterStream');

class PipeCreator {
    static create(inputStream) {
        return inputStream.pipe(ItemStream.create()).pipe(HeaderFooterStream.create());
    }    
}
    
module.exports = PipeCreator
const mongoose = require('mongoose');
const request = require('request-promise-native');

const itemSchema = mongoose.Schema({
    name: String,
    size: Number
});

itemSchema.statics.fetchOrDownloadSize = async function(name) {
    let item = await this.findOne({ name });
    if (!item) {
        const size = (await request.head(name))['content-length'];
        item = await this.create({name, size}); 
    }
    return item.size;
}

module.exports = mongoose.model('Item', itemSchema);
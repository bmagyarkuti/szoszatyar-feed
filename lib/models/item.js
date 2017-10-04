const mongoose = require('mongoose');
const request = require('request-promise-native');

const itemSchema = mongoose.Schema({
    name: String,
    size: Number
});

itemSchema.statics.fetchOrDownloadSize = async function(name) {
    let result = await this.findOne({ name });
    if (!result) {
        const response = await request.head(name);
        result = { size: response['content-length'] };
    }
    return result.size;
}

module.exports = mongoose.model('Item', itemSchema);
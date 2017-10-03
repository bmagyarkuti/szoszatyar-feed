const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: String,
    size: Number
});

itemSchema.statics.fetchOrDownloadSize = async function(name) {
    const result = await this.findOne({ name });
    return result.size;
}

module.exports = mongoose.model('Item', itemSchema);
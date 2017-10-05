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
        item = new Item({name, size});
        await item.save(); 
    }
    return item.size;
}

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
const mongoose = require('mongoose');
const request = require('request-promise-native');

const itemSchema = mongoose.Schema({
    name: String,
    size: Number,
    pubDate: Date
});

itemSchema.statics.fetchOrDownloadSize = async name => (await fetchOrDownloadItem(name)).size;

itemSchema.statics.fetchOrDownloadPubDate = async name => (await fetchOrDownloadItem(name)).pubDate.toUTCString();

fetchOrDownloadItem = async name => {
    let item = await Item.findOne({ name });
    if (!item) {
        const head = await request.head(name);
        item = new Item({name, size: head['content-length'], pubDate: head['last-modified']});
        await item.save(); 
    }
    return item;
};

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
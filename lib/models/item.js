const mongoose = require('mongoose');
const request = require('request-promise-native');

const itemSchema = mongoose.Schema({
    name: String,
    size: Number,
    pubDate: Date
});

itemSchema.statics.fetchOrDownloadSize = async name => (await fetchOrDownloadItem(name)).size;

itemSchema.statics.fetchOrDownloadPubDate = async name => (await fetchOrDownloadItem(name)).pubDate.toUTCString();

itemSchema.statics.fetchLastBuildDate = async () => {
    let itemWithMaxPubDate = await Item.find().sort({pubDate: -1}).limit(1);
    if (itemWithMaxPubDate.length === 0) {
        itemWithMaxPubDate.push({ pubDate: new Date() });
    }
    return itemWithMaxPubDate[0].pubDate.toUTCString();
};

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
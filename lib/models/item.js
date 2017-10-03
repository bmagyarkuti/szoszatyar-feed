const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
    name: String,
    size: Number
});

module.exports = mongoose.model('Item', itemSchema);
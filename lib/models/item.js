const { Schema, Model } = require('mongoose');

const itemSchema = Schema({
    name: String,
    size: Number
});

module.exports = Model('Item', itemSchema);
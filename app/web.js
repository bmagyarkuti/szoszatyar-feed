const Koa = require('koa');
const app = new Koa();
const feed = require('./controllers/feed.js');

app.use(feed);

module.exports = app;
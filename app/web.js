'use strict';

const Koa = require('koa');
const app = new Koa();
const route = require('koa-route');

const feed = require('./controllers/feed.js');

app.use(route.get("/favicon.ico", ctx => ctx.status = 404));
app.use(route.get("*", feed));

module.exports = app;
'use strict';

const app = require('./web.js');
const MongoWrapper = require('../lib/mongoWrapper')

const mongoWrapper = MongoWrapper.create();
mongoWrapper.connect()
    .then(() => {
        app.listen(process.env.PORT || 3000);    
    })
    .catch(err => {
        console.log(err);
    })
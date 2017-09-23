'use strict';

const XmlStream = require('xml-stream');
const request = require('request');

const readXmlInputStream = () => new Promise((resolve, reject) => {
    const rawInputStream = request.get('http://budling.hu/~kalman/arch/popular/szoszatyar/rss.xml');
    const xmlInputStream = new XmlStream(rawInputStream);
    let title;
    xmlInputStream.on('endElement: channel > title', function(elem) {
        title = elem.$text;
    });
    xmlInputStream.on('end', function() {
        resolve(title);
    })
    xmlInputStream.on('error', reject)
});

module.exports = async function(context) {
    context.body = await readXmlInputStream();
    context.status = 200;
} 
const request = require('request');

const req = request.head('http://www.budling.hu/~kalman/arch/popular/szoszatyar/20161214.mp3')
req.on('response', function(response) {
    console.log(response.statusCode);
    console.log(response.headers['content-length']);
})
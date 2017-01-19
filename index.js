'use strict';

var app = require('./server').create();

app.listen(3000, function () {
    console.log('Ok boss, up and running!');
});
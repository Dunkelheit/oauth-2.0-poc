'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var oauthserver = require('oauth2-server');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var model = require('./model');

app.oauth = oauthserver({
    model: model,
    grants: ['password', 'refresh_token'],
    debug: false,
    accessTokenLifetime: 1,
    refreshTokenLifetime: 5
});

app.all('/oauth/token', app.oauth.grant());

app.get('/', app.oauth.authorise(), function (req, res) {
    res.send('Secret area');
});

app.get('/dump', function (req, res) {
    model.dump();
    res.send('Check the console to see the dump');
});

app.use(app.oauth.errorHandler());

module.exports = app;


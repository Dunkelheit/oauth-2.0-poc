'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var oauthserver = require('oauth2-server');

module.exports = {

    create: function (options) {
        options = options || {};
        
        var app = express();

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        var model = require('./model');

        var oauthConfig = {
            model: options.model || model,
            grants: options.grant || ['password', 'refresh_token']
        };

        if (options.accessTokenLifetime) {
            oauthConfig.accessTokenLifetime = options.accessTokenLifetime;
        }
        if (options.refreshTokenLifetime) {
            oauthConfig.refreshTokenLifetime = options.refreshTokenLifetime;
        }

        app.oauth = oauthserver(oauthConfig);

        app.all('/oauth/token', app.oauth.grant());

        app.get('/', app.oauth.authorise(), function (req, res) {
            res.send('Secret area');
        });

        app.get('/dump', function (req, res) {
            model.dump();
            res.send('Check the console to see the dump');
        });

        app.use(app.oauth.errorHandler());

        return app;
    }

};



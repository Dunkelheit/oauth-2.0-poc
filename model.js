'use strict';

var model = module.exports;

// In-memory datastores:
var oauthAccessTokens = [];
var oauthRefreshTokens = [];
var oauthClients = [{
    clientId: 'thom',
    clientSecret: 'nightworld',
    redirectUri: ''
}];
var authorizedClientIds = {
    password: [
        'thom'
    ],
    refresh_token: [
        'thom'
    ]
};
var users = [{
    id: '123',
    username: 'thomseddon',
    password: 'nightworld'
}];

// Debug function to dump the state of the data stores
model.dump = function () {
    var inspect = require('util').inspect;
    var inspectOptions = { colors: true, depth: null };
    console.log('oauthAccessTokens', inspect(oauthAccessTokens, inspectOptions));
    console.log('oauthClients', inspect(oauthClients, inspectOptions));
    console.log('authorizedClientIds', inspect(authorizedClientIds, inspectOptions));
    console.log('oauthRefreshTokens', inspect(oauthRefreshTokens, inspectOptions));
    console.log('users', inspect(users, inspectOptions));
};

/*
 * Required
 */

model.getAccessToken = function (bearerToken, done) {
    for (var i = 0, len = oauthAccessTokens.length; i < len; i++) {
        var elem = oauthAccessTokens[i];
        if (elem.accessToken === bearerToken) {
            return done(false, elem);
        }
    }
    done(false, false);
};

model.getRefreshToken = function (bearerToken, done) {
    for (var i = 0, len = oauthRefreshTokens.length; i < len; i++) {
        var elem = oauthRefreshTokens[i];
        if (elem.refreshToken === bearerToken) {
            return done(false, elem);
        }
    }
    done(false, false);
};

model.getClient = function (clientId, clientSecret, done) {
    for (var i = 0, len = oauthClients.length; i < len; i++) {
        var elem = oauthClients[i];
        if (elem.clientId === clientId &&
            (clientSecret === null || elem.clientSecret === clientSecret)) {
            return done(false, elem);
        }
    }
    done(false, false);
};

model.grantTypeAllowed = function (clientId, grantType, done) {
    done(false, authorizedClientIds[grantType] &&
        authorizedClientIds[grantType].indexOf(clientId.toLowerCase()) >= 0);
};

model.saveAccessToken = function (accessToken, clientId, expires, userId, done) {
    oauthAccessTokens.unshift({
        accessToken: accessToken,
        clientId: clientId,
        userId: userId,
        expires: expires
    });

    done(false);
};

model.saveRefreshToken = function (refreshToken, clientId, expires, userId, done) {
    oauthRefreshTokens.unshift({
        refreshToken: refreshToken,
        clientId: clientId,
        userId: userId,
        expires: expires
    });

    done(false);
};

model.revokeRefreshToken = function (refreshToken, done) {
    console.log('Revoking the token:', refreshToken);
    done(false);
};

/*
 * Required to support password grant type
 */
model.getUser = function (username, password, done) {
    for (var i = 0, len = users.length; i < len; i++) {
        var elem = users[i];
        if (elem.username === username && elem.password === password) {
            return done(false, elem);
        }
    }
    done(false, false);
};

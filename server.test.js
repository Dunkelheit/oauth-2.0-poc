'use strict';

const request = require('request');
const expect = require('chai').expect;

const host = 'http://localhost';
const port = 3000;
const BASE_URL = host + ':' + port + '/';
const OAUTH_URL = BASE_URL + 'oauth/token';
const SECRET_URL = BASE_URL;

var app;

before(function (done) {
    app = require('./server').create();
    app = app.listen(port, function () {
        console.log('Ok boss, up and running!');
        done();
    });
});

describe('OAuth 2.0 PoC Server', function () {

    it('Authenticates successfully', function (done) {
        request.post(OAUTH_URL, {
            form: {
                grant_type: 'password',
                client_id: 'thom',
                client_secret: 'nightworld',
                username: 'thomseddon',
                password: 'nightworld'
            }
        }, function (err, res, body) {
            expect(res.statusCode).to.be.eql(200);
            body = JSON.parse(body);
            expect(body).to.have.keys('token_type', 'access_token', 'expires_in', 'refresh_token');
            done();
        });
    });

    it('Returns an error upon failed client authentication', function (done) {
        request.post(OAUTH_URL, {
            form: {
                grant_type: 'password',
                client_id: 'thom',
                client_secret: 'badsecret',
                username: 'thomseddon',
                password: 'nightworld'
            }
        }, function (err, res, body) {
            expect(res.statusCode).to.be.eql(400);
            body = JSON.parse(body);
            expect(body).to.have.keys('code', 'error', 'error_description');
            expect(body).to.have.property('error', 'invalid_client');
            done();
        });
    });

    it('Returns an error upon failed user authentication', function (done) {
        request.post(OAUTH_URL, {
            form: {
                grant_type: 'password',
                client_id: 'thom',
                client_secret: 'nightworld',
                username: 'thomseddon',
                password: 'badpassword'
            }
        }, function (err, res, body) {
            expect(res.statusCode).to.be.eql(400);
            body = JSON.parse(body);
            expect(body).to.have.keys('code', 'error', 'error_description');
            expect(body).to.have.property('error', 'invalid_grant');
            done();
        });
    });

    it('Allows authenticated users to get to the secret endpoint', function (done) {
        request.post(OAUTH_URL, {
            form: {
                grant_type: 'password',
                client_id: 'thom',
                client_secret: 'nightworld',
                username: 'thomseddon',
                password: 'nightworld'
            }
        }, function (err, res, body) {
            expect(res.statusCode).to.be.eql(200);
            body = JSON.parse(body);
            var accessToken = body.access_token;
            request.get(SECRET_URL, {
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            }, function (err, res, body) {
                expect(res.statusCode).to.be.eql(200);
                expect(body).to.eql('Secret area');
                done();
            });
        });
    });

    it('Refreshes tokens', function (done) {
        request.post(OAUTH_URL, {
            form: {
                grant_type: 'password',
                client_id: 'thom',
                client_secret: 'nightworld',
                username: 'thomseddon',
                password: 'nightworld'
            }
        }, function (err, res, body) {
            expect(res.statusCode).to.be.eql(200);
            body = JSON.parse(body);
            var refreshToken = body.refresh_token;
            request.post(OAUTH_URL, {
                form: {
                    grant_type: 'refresh_token',
                    client_id: 'thom',
                    client_secret: 'nightworld',
                    refresh_token: refreshToken
                }
            }, function (err, res, body) {
                expect(res.statusCode).to.be.eql(200);
                body = JSON.parse(body);
                expect(body).to.have.keys('token_type', 'access_token', 'expires_in', 'refresh_token');
                done();
            });
        });
    });

    it('Does not allow expired tokens', function (done) {
        this.timeout(5000);

        app.close();
        app = require('./server').create({
            accessTokenLifetime: 1,
            refreshTokenLifetime: 5
        });

        app = app.listen(port, function () {

            request.post(OAUTH_URL, {
                form: {
                    grant_type: 'password',
                    client_id: 'thom',
                    client_secret: 'nightworld',
                    username: 'thomseddon',
                    password: 'nightworld'
                }
            }, function (err, res, body) {
                expect(res.statusCode).to.be.eql(200);
                body = JSON.parse(body);
                var accessToken = body.access_token;
                setTimeout(function () {
                    request.get(SECRET_URL, {
                        headers: {
                            Authorization: 'Bearer ' + accessToken
                        }
                    }, function (err, res, body) {
                        expect(res.statusCode).to.be.eql(401);
                        body = JSON.parse(body);
                        expect(body).to.have.keys('code', 'error', 'error_description');
                        expect(body).to.have.property('error_description', 'The access token provided has expired.');
                        done();
                    });
                }, 2000);
            });

        });
    });

});
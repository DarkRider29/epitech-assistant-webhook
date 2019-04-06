'use strict';

const rp = require('request-promise');
const util = require('util');
const config = require('../config');

class Emma {

    constructor(email) {
        this.email = email;
    }

    getCommingEvents(data = {}) {
        return rp({
            uri: `${config.emmaUrl}/api/user/${this.email}/comingEvents`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getUserdata(data = {}) {
        return rp({
            uri: `${config.emmaUrl}/api/user/${this.email}/`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }
}

module.exports = {Emma};
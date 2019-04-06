const rp = require('request-promise');
const config = require('../config');

class Amazon {

    constructor(access_token) {
        this.access_token = access_token;
        this.baseUrl = `${config.amazonUrl}/user/profile?access_token=${access_token}`
    }

    getUser() {
        console.log(`Send request: ${this.baseUrl}`);
        return rp({
            uri: `${this.baseUrl}`,
            method: 'GET',
            qs: {},
            json: true,
        });
    }
}

module.exports = {Amazon};

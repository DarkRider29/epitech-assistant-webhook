'use strict';

const rp = require('request-promise');
const util = require('util');
const config = require('../config');

class Intra {

    constructor(token, login) {
        console.log('token=' + token + ' , login=' + login);
        this.token = token;
        this.login = login;
        this.baseUrl = `${config.intraUrl}/${token}`
    }

    fetch(endpoint, data = {}) {
        console.log(`Send request: ${this.baseUrl}${endpoint}?format=json`);
        return rp({
            uri: `${this.baseUrl}${endpoint}?format=json`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getUser(user, data = {}) {
        console.log(`Send request: ${this.baseUrl}/user/${user}?format=json`);
        return rp({
            uri: `${this.baseUrl}/user/${user}?format=json`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getMarks(data = {}) {
        console.log(`Send request: ${this.baseUrl}/user/${this.login}/notes?format=json`);
        return rp({
            uri: `${this.baseUrl}/user/${this.login}/notes?format=json`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getAbsence(data = {}) {
        console.log(`Send request: ${this.baseUrl}/user/notification/missed?format=json`);
        return rp({
            uri: `${this.baseUrl}/user/notification/missed?format=json`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getBinomes(data = {}) {
        console.log(`Send request: ${this.baseUrl}/user/${this.login}/binome?format=json`);
        return rp({
            uri: `${this.baseUrl}/user/${this.login}/binome?format=json`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getAlerts(data = {}) {
        console.log(`Send request: ${this.baseUrl}/user/notification/alert?format=json`);
        return rp({
            uri: `${this.baseUrl}/user/notification/alert?format=json`,
            method: 'GET',
            qs: data,
            json: true,
            headers: {"Accept-Language": "fr-FR"}
        });
    }

    getNetsoul(data = {}) {
        console.log(`${this.baseUrl}/user/${this.login}/netsoul?format=json`);
        return rp({
            uri: `${this.baseUrl}/user/${this.login}/netsoul?format=json`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getSchedule(start, end, data = {}) {
        console.log(`${this.baseUrl}/planning/load?format=json&start=${start}&end=${end}`);
        return rp({
            uri: `${this.baseUrl}/planning/load?format=json&start=${start}&end=${end}`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getScheduleAll(data = {}) {
        console.log(`Send request: ${this.baseUrl}/planning/load?format=json`);
        return rp({
            uri: `${this.baseUrl}/planning/load?format=json`,
            method: 'GET',
            qs: data,
            json: true,
        });
    }

    getNotifications(data = {}) {
      console.log(`Send request: ${this.baseUrl}/user/notification/message?format=json`);
        return rp({
            uri: `${this.baseUrl}/user/notification/message?format=json`,
            method: 'GET',
            qs: data,
            json: true,
            headers: {"Accept-Language": "fr-FR"}
        });
    };
}

module.exports = {Intra};

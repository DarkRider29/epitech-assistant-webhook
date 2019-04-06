'use strict';

const firebase = require('firebase-admin');
const serviceAccount = require('../users/account');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: ''
});

const DB = firebase.firestore();

DB.settings({
    timestampsInSnapshots: true
});

exports.module = function (db) {
    if (DB) {
        db(DB);
    } else {

    }
}

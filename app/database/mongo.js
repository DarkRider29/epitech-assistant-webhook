'use strict';

const {MongoClient} = require('mongodb');
const config = require('../config');

let DB;

exports.module = function (db) {

    if (DB) {
        db(DB);
    } else {
        MongoClient.connect(config.mongoDBUrl, (err, client) => {
            if (!err) {
                console.log('mongo : Database connexion successful');
                DB = client;
                db(client);
            } else {
                console.error('mongo ' + err );
            }
        })
    }
};


'use strict';

const fs = require('fs');

function getLanguage(local, text) {

    const path = local + '/' + local + '.json';

    const l = require(path);
    console.log(text);

    const data = fs.readFileSync(path);


    const store = localStorage('./' + local + '/' + local + '.json');

    return store.get(text);
}

module.exports = getLanguage();
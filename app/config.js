'use strict';

module.exports = {
    port: process.env.port || process.env.PORT || 1484,
    version: 1.0,
    mongoDBUrl: process.env.MONGODB_URL || 'mongodb://localhost/assistant',
    intraUrl: process.env.INTRA_URL || 'https://intra.epitech.eu',
    emmaUrl: process.env.EMMA_URL || 'http://localhost:2256',
    amazonUrl: 'https://api.amazon.com'
}

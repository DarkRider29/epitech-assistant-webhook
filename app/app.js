'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const util = require('util');
const Alexa = require('ask-sdk-core');
const config = require('./config');
const {DialogflowAssistant} = require('./assistant/dialogflow-assistant');
const {Intra} = require('./api/intra')
const cors = require('cors');

const {AlexaHandler} = require('./assistant/alexa-assistant');

const app = express();

app.use(cors({origin: '*'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.route('/dialogflow').post(((request, response) => {

    console.log('Dialogflow Request headers : ' + util.inspect(request.headers, false, null, true));
    console.log('Dialogflow Request body : ' + util.inspect(request.body, false, null, true));

    const dialogflowAssistant = new DialogflowAssistant({request, response});
    dialogflowAssistant.sendRequest();
}));

app.route('/alexa').post(((request, response) => {

    console.log('Alexa Request headers : ' + util.inspect(request.headers, false, null, true));
    console.log('Alexa Request body : ' + util.inspect(request.body, false, null, true));

    const context = {
        fail: () => {
            // Simply fail with internal server error
            response.sendStatus(500);
        },
        succeed: data => {
            // console.log(data)
            response.send(data);
        }
    };

    const alexaAssistant = new AlexaHandler({request, response}, context);
    alexaAssistant.sendRequest();
}));

app.route('/intra/:email').get((request, response) => {
    const intra = new Intra('', null);
    intra.getUser(request.param('email')).then((r) => {
        response.send(r);
        response.status(200).end();
    }).catch(e => {
        console.log(e);
    })
});

app.listen(config.port, function () {
    console.log("Server is up and listening on port " + config.port);
});




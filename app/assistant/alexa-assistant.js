'use strict';

const Alexa = require('ask-sdk-core');
const util = require('util');
const {Amazon} = require('../api/amazon');
const {User} = require('../users/user');

class AlexaHandler {

    constructor(options, context) {
        this.options = options;
        this.context = context;
        this.skills = null;
        this.alexa = null;
        this.linked = false;
        this.user = null;
        if (!options.request) {
            throw new Error('Request can NOT be empty.');
        }
        if (!options.response) {
            throw new Error('Response can NOT be empty.');
        }
        this.handleRequestUser();
    }

    sendRequest() {
        if (!this.options.request) {
            throw new Error('Request can NOT be empty.')
        }
        this.skills.invoke(this.options.request.body).then((r) => {
            this.options.response.json(r);
        });
    }


    handleRequestUser() {
        this.skills = Alexa.SkillBuilders.custom()
            .addRequestInterceptors(this.RequestInterceptor)
            .addRequestHandler(this.LaunchRequestUserMatcher, this.LaunchRequestUserResponse)
            .addRequestHandler(this.LaunchRequestGuestMatcher, this.LaunchRequestGuestResponse)
            .addRequestHandler(this.RequestGetGPAMatcher, this.RequestGetGPAResponse)
            .addRequestHandler(this.RequestLastMarkMatcher, this.RequestLastMarkResponse)
            .addRequestHandler(this.RequestCreditsMatcher, this.RequestCreditsResponse)
            .addRequestHandler(this.RequestBestBinomeMatcher, this.RequestBestBinomeResponse)
            .addRequestHandler(this.RequestCustomNotificationMatcher, this.RequestCustomNotificationResponse)
            .addRequestHandler(this.RequestGetAlertsMatcher, this.RequestGetAlertsResponse)
            .addRequestHandler(this.RequestCustomMarksMatcher, this.RequestCustomMarksResponse)
            .addRequestHandler(this.RequestGetNextEmmaEventMatcher, this.RequestGetNextEmmaEventResponse)
            .addRequestHandler(this.RequestGetLastNotifMatcher, this.RequestGetLastNotifResponse)
            .addRequestHandler(this.RequestGetCycleMatcher, this.RequestGetCycleResponse)
            .addRequestHandler(this.RequestGetEpicesMatcher, this.RequestGetEpicesResponse)
            .addRequestHandler(this.RequestGetConsummedSpicesMatcher, this.RequestGetConsummedSpicesResponse)
            .addRequestHandler(this.RequestGetSemesterMatcher, this.RequestGetSemesterResponse)
            .addRequestHandler(this.RequestGetLastNotificationsMatcher, this.RequestGetLastNotificationsResponse)
            .addRequestHandler(this.RequestGetLogMatcher, this.RequestGetLogResponse)
            .create();
    }

    RequestInterceptor(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        const {accessToken} = handlerInput.requestEnvelope.context.System.user;
        attributes.assistant = this;
        this.alexa = new Amazon(accessToken);
        return new Promise((resolve, reject) => {
            this.alexa.getUser().then((r) => {
                this.user = new User(r.user_id);
                this.user.existe().then((value) => {
                    if (value) {
                        this.user.isConnected().then((status) => {
                            this.linked = status;
                            handlerInput.attributesManager.setSessionAttributes(attributes);
                            resolve(status);
                        }).catch((e) => {
                            reject(e);
                        })
                    }
                }).catch((e) => {
                    reject(e);
                })
            });
        });
    };

    //#region LaunchRequest

    LaunchRequestUserMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest' && attributes.assistant.linked;
    }

    LaunchRequestUserResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getWelcome().then((r) => {
                resolve(handlerInput.responseBuilder.speak(r).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    LaunchRequestGuestMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest' && !attributes.assistant.linked;
    }

    LaunchRequestGuestResponse(handlerInput) {
        return new Promise((resolve, reject) => {
            resolve(handlerInput.responseBuilder
                .speak("Bienvenue sur l'assistant Epitech, merci de relier votre compte Epitech depuis notre site !").getResponse());
        })
    }

    //#endregion

    //#region GPA

    RequestGetGPAMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechGpaGet"
            && attributes.assistant.linked;
    }

    RequestGetGPAResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getGPA().then((r) => {
                const response = 'Votre moyenne est de ' + r + '.';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }
    //#endregion

    //#region GetCredits

    RequestCreditsMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechCreditsGet"
            && attributes.assistant.linked;
    }

    RequestCreditsResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getCredits().then((r) => {
                const response = 'vous avez actuellement ' + r + ' credits.';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region LastMark

    RequestLastMarkMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechMarkGetLast"
            && attributes.assistant.linked;
    }

    RequestLastMarkResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getLastMark().then((r) => {
                const response = 'Votre derniere note est est ' + r.note + 'au projet: ' + r.title + '.';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetCustomMarkAmount

    RequestCustomMarksMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechMarkGetCustom"
            && attributes.assistant.linked;
    }

    RequestCustomMarksResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        var numberSlot = handlerInput.requestEnvelope.request.intent.slots.numberslot.value;
        console.log(handlerInput.requestEnvelope.request.intent.slots);
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getMarks(numberSlot).then((mark) => {
                let response = 'Vos ' + numberSlot + ' dernieres notes sont ';
                for (let i = 0; i < mark.marks.length; i++) {
                    response += mark.marks[i].final_note;
                    response += " au ";
                    response += mark.marks[i].title;
                    if (i + 1 != mark.marks.length - 1)
                        response += ' ';
                    else
                        response += ' et '
                }
                response += '.';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }


    //#endregion

    //#region BestBinome

    RequestBestBinomeMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechBinomeGet"
            && attributes.assistant.linked;
    }

    RequestBestBinomeResponse(handlerInput) {
            let attributes = handlerInput.attributesManager.getSessionAttributes();
            return new Promise((resolve, reject) => {
                attributes.assistant.user.getBestBinome().then((r) => {
                    const response = 'Votre meilleur binome est: ' + r.firstName + r.lastName;
                    resolve(handlerInput.responseBuilder.speak(response).getResponse());
                }).catch((e) => {
                    reject(e);
                });
            })
    }

    //#endregion

    //#region GetCustomNofificationAmount

    RequestCustomNotificationMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechNotificationGetCustom"
            && attributes.assistant.linked;
    }

    RequestCustomNotificationResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        var numberSlot = handlerInput.requestEnvelope.request.intent.slots.numberslot.value;
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getNotifs(numberSlot).then((r) => {
                const response = 'Vos ' + numberSlot + ' dernieres notifications sont: ' + r;
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }


    //#endregion

    //#region GetAlerts

    RequestGetAlertsMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechNotificationsGetAlerts"
            && attributes.assistant.linked;
    }

    RequestGetAlertsResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getAlerts().then((alerts) => {
                let response = '';
                for (let i = 0; i < alerts.length; i++) {
                    response += 'Attention, ';
                    response += alerts[i].title;
                }
                if (response === '')
                    response = 'Vous n\'avez pas d\'alertes';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetNextEmmaEvent

    RequestGetNextEmmaEventMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EmmaEventGetNext"
            && attributes.assistant.linked;
    }

    RequestGetNextEmmaEventResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getEmmaNext().then((r) => {
                const response = r;
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetLastNotif

    RequestGetLastNotifMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechNotificationGetLast"
            && attributes.assistant.linked;
    }

    RequestGetLastNotifResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getNotifLast().then((r) => {
                const response = 'Votre derniere notification est: ' + r;
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetCycle

    RequestGetCycleMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechCycleGet"
            && attributes.assistant.linked;
    }

    RequestGetCycleResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getCycle().then((r) => {
                const response = 'Vous êtes actuellement en ' + r + '.';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetEpices

    RequestGetEpicesMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechSpicesGet"
            && attributes.assistant.linked;
    }

    RequestGetEpicesResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getSpices().then((r) => {
                const response = 'Vous avez actuellement ' + r + ' épices.' ;
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetConsummedSpices

    RequestGetConsummedSpicesMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechSpicesGetConsumed"
            && attributes.assistant.linked;
    }

    RequestGetConsummedSpicesResponse (handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getConsumedSpices().then((r) => {
                const credits = r / 60;
                const response = 'Vous avez utilisé ' + r + ' épices pour ' + credits + ' crédits.';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetSemester

    RequestGetSemesterMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechSemesterGet"
            && attributes.assistant.linked;
    }

    RequestGetSemesterResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getSemester().then((r) => {
                const response = 'Vous êtes actuellement au semestre: ' + r + '.';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetNotifs

    RequestGetLastNotificationsMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechNotificationGet"
            && attributes.assistant.linked;
    }

    RequestGetLastNotificationsResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getNotifs(3).then((r) => {
                const response = 'Vos dernieres notifications sont: ' + r;
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion

    //#region GetLog

    RequestGetLogMatcher(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === "EpitechLogGet"
            && attributes.assistant.linked;
    }

    RequestGetLogResponse(handlerInput) {
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        return new Promise((resolve, reject) => {
            attributes.assistant.user.getNetsoul().then((r) => {
                const response = 'Votre temps de log est de  ' + r + ' heures';
                resolve(handlerInput.responseBuilder.speak(response).getResponse());
            }).catch((e) => {
                reject(e);
            });
        })
    }

    //#endregion
}

module.exports = {AlexaHandler};

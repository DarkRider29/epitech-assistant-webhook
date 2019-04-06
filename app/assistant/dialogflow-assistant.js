'use strict';

const util = require('util');
const {User} = require('../users/user');
const {WebhookClient} = require('../dialogflow-fulfillment/dialogflow-fulfillment');
const {SignIn} = require('actions-on-google');
const jwt = require('jsonwebtoken');

class DialogflowAssistant {

    constructor(options) {
        if (!options.request) {
            throw new Error('Request can NOT be empty.');
        }
        if (!options.response) {
            throw new Error('Response can NOT be empty.');
        }
        this.agent = new WebhookClient(options, this);
        this.options = options
    }

    sendRequest() {
        if (!this.options.request) {
            throw new Error('Request can NOT be empty.')
        }
        if (this.options.request.body.originalDetectIntentRequest.payload.user.idToken) {
            this.user = new User(this.options.request.body.originalDetectIntentRequest.payload.user.idToken);
            this.user.decodeToken();
            this.user.existe().then((value) => {
                if (value) {
                    this.user.isConnected().then((status) => {
                        if (status)
                            this.handleRequestUser();
                        else
                            this.handleRequestGuest();
                    }).catch((e) => {
                        console.error(e)
                    })
                }
            }).catch((e) => {
                console.error(e)
            })
        } else {
            this.handleRequestGuest();
        }
    }

    /*
        Intentions
     */
    welcomeGuest(agent) {
        console.log("Guest");
        return new Promise((resolve, reject) => {
            let conv = agent.conv();
            conv.ask(new SignIn("Permission requise"));
            resolve(agent.add(conv));
        })
    }

    welcomeUser(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getWelcome().then((sentence) => {
                resolve(agent.add(sentence));
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetGPA(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getGPA().then((gpa) => {
                resolve(agent.add('Votre moyenne est de ' + gpa + '.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetCredits(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getCredits().then((credits) => {
                resolve(agent.add('Vous avez ' + credits + ' crédits.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetSpices(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getSpices().then((spices) => {
                resolve(agent.add('Vous avez ' + spices + ' épices.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetConsumedSpices(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getConsumedSpices().then((spices) => {
                const credits = spices / 60
                resolve(agent.add('Vous avez utilisé ' + spices + ' épices pour ' + credits + ' crédits.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetCycle(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getCycle().then((cycle) => {
                resolve(agent.add('Vous etes actuellement en cycle ' + cycle + '.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetSemester(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getSemester().then((semester) => {
                resolve(agent.add('Vous etes actuellement en semestre ' + semester + '.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetPromo(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getPromo().then((promo) => {
                resolve(agent.add('Vous etes en promotion ' + promo + '.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetLastMark(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getLastMark().then((mark) => {
                resolve(agent.add('Votre dernière note est de ' + mark.note + ' au ' + mark.title + '.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetMarks(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getMarks(3).then((mark) => {
                let response = 'Vos dernières notes sont ';
                for (let i = 0; i < mark.marks.length; i++) {
                    response += mark.marks[i].final_note;
                    response += " au ";
                    response += mark.marks[i].title;
                    if (i + 1 != mark.marks.length - 1)
                        response += ',';
                    else
                        response += ' et '
                }
                response += '.';
                resolve(agent.add(response));
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetMarksCustom(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getMarks(agent.parameters.number).then((mark) => {
                let response = 'Vos dernières ' + agent.parameters.number + ' notes sont ';
                for (let i = 0; i < mark.marks.length; i++) {
                    response += mark.marks[i].final_note;
                    response += " au ";
                    response += mark.marks[i].title;
                    if (i + 1 != mark.marks.length - 1)
                        response += ', ';
                    else
                        response += ' et '
                }
                response += '.';
                resolve(agent.add(response));
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetBestBinome(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getBestBinome().then((name) => {
                resolve(agent.add('Votre meilleur binome est avec ' + name.firstName + ' ' + name.lastName + '.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetBinomes(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getBinomes().then((name) => {
                resolve(agent.add('Vos meilleurs binomes sont avec ' + name.binomes[0].firstName + ' '
                    + name.binomes[0].lastName + ', ' + name.binomes[1].firstName + ' ' + name.binomes[1].lastName +
                    ' et ' + name.binomes[2].firstName + ' ' + name.binomes[2].lastName + '.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetAlerts(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getAlerts().then((alerts) => {
                console.log(util.inspect(alerts, false, null, true));
                let response = '';
                for (let i = 0; i < alerts.length; i++) {
                    response += 'Attention, ';
                    response += alerts[i].title;
                }
                if (response === '')
                    response = 'Vous n\'avez pas d\'alertes';
                resolve(agent.add(response));
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetLogs(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getNetsoul().then((log) => {
                console.log(`temps de log: ${log}`)
                resolve(agent.add('Votre temps de log est de ' + log + ' heures.'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetSchedule(agent, assistant) {
        return new Promise((resolve, reject) => {
            console.log(util.inspect(agent.parameters, true, null, true));
            assistant.user.getSchedule(agent.parameters).then((sentence) => {
                resolve(agent.add(sentence));
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetNotifs(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getNotifs(3).then((notifs) => {
                let response = 'Vos dernières notifications sont ' + notifs;
                resolve(agent.add(response));
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetNotifLast(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getNotifLast().then((sentence) => {
                resolve(agent.add(sentence));
            }).catch((e) => {
                reject(e);
            })
        })
    }

    intentGetLastAbsence(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getLastAbsence().then((sentence) => {
                let response = "votre derniere absence est : " + sentence;
                resolve(agent.add(response));
            }).catch((e) => {
                reject(e)
            })
        });
    }

    intentGetAbsences(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getAbsences(agent.parameters.number).then((sentence) => {
                let response = `Vos ${agent.parameters.number} dernieres absences sont : ` + sentence;
                resolve(agent.add(response))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetNotifsCustom(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getNotifs(agent.parameters.number).then((notifs) => {
                let response = 'Vos ' + agent.parameters.number + ' dernières notifications sont ' + notifs;
                resolve(agent.add(response));
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentGetEmmaNext(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getEmmaNext().then((sentence) => {
                resolve(agent.add(sentence));
            }).catch((e) => {
                reject(e);
            })
        });
    }

    intentSignIn(agent, assistant) {
        return new Promise((resolve, reject) => {
            assistant.user.getName().then((name) => {
                resolve(agent.add('Bienvenue sur l\'assistant Epitech, ' + name + '!'))
            }).catch((e) => {
                reject(e)
            })
        })
    }

    intentSignInGuest(agent, assistant) {
        console.log("Guest2");
        return new Promise((resolve, reject) => {
            resolve(agent.add("Bienvenue sur l\'assistant Epitech, merci de relier votre compte Epitech depuis notre site !"));
        });
    }

    handleRequestUser() {
        let intentMap = new Map()
        intentMap.set('Default Welcome Intent', this.welcomeUser)
        intentMap.set('epitech.absence.last.get', this.intentGetLastAbsence)
        intentMap.set('epitech.absences.get', this.intentGetAbsences)
        intentMap.set('epitech.gpa.get', this.intentGetGPA)
        intentMap.set('epitech.signin.get', this.intentSignIn)
        intentMap.set('epitech.credits.get', this.intentGetCredits)
        intentMap.set('epitech.spices.get', this.intentGetSpices)
        intentMap.set('epitech.spices.get.consumed', this.intentGetConsumedSpices)
        intentMap.set('epitech.cycle.get', this.intentGetCycle)
        intentMap.set('epitech.semester.get', this.intentGetSemester)
        intentMap.set('epitech.promo.get', this.intentGetPromo)
        intentMap.set('epitech.mark.get.last', this.intentGetLastMark)
        intentMap.set('epitech.mark.get', this.intentGetMarks)
        intentMap.set('epitech.mark.get.custom', this.intentGetMarksCustom)
        intentMap.set('epitech.binome.get.best', this.intentGetBestBinome)
        intentMap.set('epitech.binome.get', this.intentGetBinomes)
        intentMap.set('epitech.notifications.get.alerts', this.intentGetAlerts)
        intentMap.set('epitech.log.get', this.intentGetLogs)
        intentMap.set('epitech.schedule.get', this.intentGetSchedule)
        intentMap.set('epitech.notification.get', this.intentGetNotifs)
        intentMap.set('epitech.notification.get.last', this.intentGetNotifLast)
        intentMap.set('epitech.notification.get.custom', this.intentGetNotifsCustom)
        intentMap.set('emma.event.get.next', this.intentGetEmmaNext)
        this.agent.handleRequest(intentMap).then(() => {
            console.log('Execute')
        }).catch((e) => {
            console.error(e)
        })
    }

    handleRequestGuest() {
        let intentMap = new Map()
        intentMap.set('Default Welcome Intent', this.welcomeGuest);
        intentMap.set('epitech.signin.get', this.intentSignInGuest);
        this.agent.handleRequest(intentMap).then(() => {
            console.log('Execute')
        }).catch((e) => {
            console.error(e)
        })
    }
}

module.exports = {DialogflowAssistant: DialogflowAssistant};

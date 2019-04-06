'use strict';

const firebase = require('firebase-admin');
const serviceAccount = require('./account');
const {Intra} = require('../api/intra');
const {Emma} = require('../api/emma');
const util = require('util');
const jwt = require('jsonwebtoken');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: ''
});

const db = firebase.firestore();

db.settings({
    timestampsInSnapshots: true
});

const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

class User {

    constructor(userId) {
        this.userId = userId;
    }

    decodeToken() {
        const decoded = jwt.decode(this.userId, {complete: true});

        this.userId = decoded.payload.sub;
    }

    existe() {
        return new Promise((resolve, reject) => {
            db.collection('users').get().then((query) => {
                let found = false;
                query.forEach((doc) => {
                    if (doc.id === this.userId)
                        found = true;
                });
                /*if (!found)
                    this.createAccount();*/
                resolve(found);
            }).catch((err) => {
                reject(err)
            });
        });
    }

    createAccount() {
        db.collection('users').doc(this.userId).set({
           connected: false
        });
    }

    isConnected() {
        return new Promise((resolve, reject) => {
            db.collection('users').get().then((query) => {
                let found = false;
                query.forEach((doc) => {
                    if (doc.id === this.userId && doc.data().connected === true) {
                        this.intra = new Intra(doc.data().autologin, doc.data().email);
                        this.emma = new Emma(doc.data().email);
                        found = true;
                    }
                });
                resolve(found);
            }).catch((err) => {
                reject(err)
            });
        });

    }

    getGPA() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
                resolve(result.gpa[0].gpa)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getCredits() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
                resolve(result.credits)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getSpices() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
                resolve(result.spice.available_spice)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getConsumedSpices() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
                resolve(result.spice.consumed_spice)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getCycle() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
                resolve(result.gpa[0].cycle)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getSemester() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
                resolve(result.semester_code)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getPromo() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
                resolve(result.promo)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getLastMark() {
        return new Promise((resolve, reject) => {
            this.intra.getMarks().then((result) => {
                const lastElement = result.notes[result.notes.length - 1]

                const resultMark = {
                    "note": lastElement.final_note,
                    "title": lastElement.title
                }
                resolve(resultMark)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getMarks(number) {
        return new Promise((resolve, reject) => {
            this.intra.getMarks().then((result) => {
                let resultMark = {"marks": []};
                resultMark["marks"] = result.notes.filter((cur, idx, map) => {
                    if (map.length - number <= idx)
                        return cur;
                });
                resolve(resultMark)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getBestBinome() {
        return new Promise((resolve, reject) => {
            this.intra.getBinomes().then((result) => {
                const name = this.getNameFromeLogin(result.binomes[0].login)
                console.log(name)
                resolve(name)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getBinomes() {
        return new Promise((resolve, reject) => {
            this.intra.getBinomes().then((result) => {
                let binomes1 = this.getNameFromeLogin(result.binomes[0].login)
                let binomes2 = this.getNameFromeLogin(result.binomes[1].login)
                let binomes3 = this.getNameFromeLogin(result.binomes[2].login)

                const binomes = {
                    "binomes": [
                        {"firstName": binomes1.firstName, "lastName": binomes1.lastName},
                        {"firstName": binomes2.firstName, "lastName": binomes2.lastName},
                        {"firstName": binomes3.firstName, "lastName": binomes3.lastName}
                    ]
                }
                console.log(binomes)
                resolve(binomes)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getAlerts() {
        return new Promise ((resolve, reject) => {
           this.intra.getAlerts().then((result) => {
               resolve(result);
           }).catch((e) => {
               reject(e);
           });
        });
    }

    getNetsoul() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
               resolve(result.nsstat.active);
            }).catch((e) => {
                reject(e);
            });
        });
    }

    getName() {
        return new Promise((resolve, reject) => {
            this.intra.fetch('/user').then((result) => {
                resolve(result.firstname)
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getSchedule(entities) {
        return new Promise((resolve, reject) => {
            /*this.intra.getSchedule(start, end).then((result) => {
                // ici
            }).catch((e) => {
                reject(e)
            })*/
            if (entities['date']) {
                this.getSchduleDate(entities['date']).then((sentence) => resolve(sentence)).catch((e) => reject(e));
            } else if (entities['time-period']) {
               this.getSchduleTimePeriod(entities['time-period']);
            }
        })
    }

    getSchduleTimePeriod(period) {
        let start = new Date(period.startTime);
        let end = new Date(period.endTime);
        Promise.all([this.intra.fetch('/user'), this.intra.getSchedule(this.formatDateToIntra(start), this.formatDateToIntra(end))]).then((values) => {
            let data = values[1].filter((cur, idx, map) => {
                if (values[0].location === cur.instance_location && cur.event_registered === 'registered')
                    return cur;
            })
            let sentence = ``;
            data.forEach((e) => {
                if (e.is_rdv === '1') {

                }
            })
            console.log(util.inspect(data, true,  null, true));
        }).catch((e) => {
            console.log(e);
        })
    }

    getSchduleDate(date) {
        return new Promise((resolve, reject) => {
            let start = new Date(date);
            let end = new Date(date);
            let sentence = ``;
            Promise.all([this.intra.fetch('/user'), this.intra.getSchedule(this.formatDateToIntra(start), this.formatDateToIntra(end))]).then((values) => {
                let data = values[1].filter((cur, idx, map) => {
                    if (values[0].location === cur.instance_location && cur.event_registered === 'registered')
                        return cur;
                })
                if (data.length === 0) {
                    sentence = 'Vous n\'avez rien !';
                    resolve(sentence);
                    return;
                }
                sentence += this.formatDateDayFrench(start.getDay());
                sentence += ` ${start.getDate()} vous avez `;
                data.forEach((e) => {
                    if (e.is_rdv === '1') {

                    } else {
                        let schDate = new Date(e.start);
                        sentence += `${e.acti_title} à ${schDate.getHours()}h${schDate.getMinutes()}, `
                    }
                })
                console.log(util.inspect(data, true, null, true));
                console.log(sentence);
                resolve(sentence);
            }).catch((e) => {
                reject(e);
            })
        });
    }

    formatDateToIntra(date) {
        let str = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        return str;
    }

    formatDateDayFrench(day) {
        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        return days[day];
    }

    getNameFromeLogin(login) {

        let firstAndLast = login.split('@')

        firstAndLast = firstAndLast[0].split('.')


        let firstName = firstAndLast[0]
        let lastName = firstAndLast[1]

        const name = {
            "firstName": firstName,
            "lastName": lastName
        }
        return name
    }

    getNotifs(number) {
        return new Promise((resolve, reject) => {
            this.intra.getNotifications().then((response) => {
                if (response.length === 0) {
                    resolve("Vous n'avez pas de notifications")
                } else if (response.length < number) {
                    number = response.length;
                }
                let sentence = "";
                let regex = /<a[^>]*>([^<]+)<\/a>/g;
                for (let i = 0; i < number; i++) {
                    response[i].title.split(regex).forEach((item) => {
                        sentence += item;
                    });
                    i === number - 1 ? sentence += '.' : sentence += ', ';
                }
                resolve(sentence);
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getNotifLast() {
        return new Promise((resolve, reject) => {
            this.intra.getNotifications().then((response) => {
              if (response.length === 0) {
                  resolve("Vous n'avez pas de notifications")
              }
              let sentence = "";
              let regex = /<a[^>]*>([^<]+)<\/a>/g;
              response[0].title.split(regex).forEach((item) => {
                  sentence += item;
              });
              resolve(sentence);
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getAbsences(number) {
        return new Promise((resolve, reject) => [
            this.intra.getAbsence().then((response) => {
                if (response.length === 0) {
                    resolve("Vous n'avez pas d'absence")
                }
                let sentence = ""
                let regex = /<a[^>]*>([^<]+)<\/a>/g;
                for (let i = 0; i < number; i++) {
                    response.others[i].acti_title.split(regex).forEach((item) => {
                        sentence += item;
                    });
                    i === number - 1 ? sentence += '.' : sentence += ', ';
                }

                resolve(sentence)

            }).catch((e) => {
                reject(e)
            })
        ])
    }

    getLastAbsence() {
        return new Promise((resolve, reject) => {
            this.intra.getAbsence().then((response) => {
                if (response.length === 0) {
                    resolve("Vous n'avez pas d'absence")
                }
                let sentence = ""
                let regex = /<a[^>]*>([^<]+)<\/a>/g;

                if (response.recents.length === 0)
                {
                    response.others[0].acti_title.split(regex).forEach((item) => {
                        sentence += item;
                    });
                }
                else
                {
                    response.recents[0].acti_title.split(regex).forEach((item) => {
                        sentence += item;
                    });
                }

                resolve(sentence);
            }).catch((e) => {
                reject(e)
            })
        })
    }

    getEmmaNext() {
        return new Promise((resolve, reject) => {
            this.emma.getCommingEvents(this.emma.email).then((response) => {
                if (response.error === true || response.length === 0)
                    resolve("Vous n'avez pas de prochains évenements Emma");
                let start = new Date(response[0].start * 1000);
                let end = new Date(response[0].end * 1000);
                resolve("Votre prochain événement Emma est " + response[0].title + " le " + start.getDay() + " " + monthNames[start.getMonth()] + " de "
                    + start.getHours() + "H" + start.getMinutes() + " à " + end.getHours() + "H" + end.getMinutes());
            }).catch((e) => {
                reject(e);
            })
        });
    }

    getWelcome() {
        return new Promise((resolve, reject) => {
            this.getName().then((response) => {
                resolve('Bienvenue sur l\'assistant Epitech, ' + response + '!')
            });
        }).catch((e) => {
            reject(e);
            console.log(e);
        })
    }
}


module.exports = {User};

'use strict';

const Homey = require('homey');
let push = require('pushover-notification-client');
let http = require('http.min');

class MyApp extends Homey.App {
    async onInit() {
        this.account = [];
        this.request = [];
        this.validation = 0;
        this.devices = null;
        this.pushoverUser = null;
        this.pushoverGroup = null;
        this.pushoverToken = null;

        // Start building Pushover accounts array
        let that = this;
        this.buildPushoverArray();
        this.createInsightlog();
        this.homey.settings.on('set', function (settingname) {
            if (settingname === 'pushoveraccount') {
                that.homey.log('Pushover - Account has been changed/updated...');
                that.buildPushoverArray();
            }
        });

        let sendMessageDevice = this.homey.flow.getActionCard('pushoverSend_device');
        sendMessageDevice
            .registerRunListener((args, state) => {
                if (typeof this.validation == 'undefined' || this.validation === 0) return new Error("Pushover api/token key not configured or valid under settings!");
                let tempUser = this.pushoverUser;
                let tempToken = this.pushoverToken;
                let pMessage = args.message;
                let pTitle = args.title;
                let pSound = args.sound
                if (typeof pMessage == 'undefined' || pMessage == null || pMessage == '') return new Error("Message can not be empty");
                let pDevice = args.device.name;
                if (pDevice == null || pDevice == '') return new Error("No devices registered on this Pushover account!");
                let pPriority = args.priority;
                let pRetry = args.retry;
                let pExpire = args.expire;
                return this.pushoverSend_device(tempUser, tempToken, pMessage, pTitle, pDevice, pPriority, pRetry, pExpire, pSound);
            })
        sendMessageDevice.getArgument('device').registerAutocompleteListener((query, args) => {
            let deviceSearchString = query;
            let items = this.searchForDevicesByValue(deviceSearchString);
            this.homey.log(items)
            return Promise.resolve(items);
        });
        let sendMessage = this.homey.flow.getActionCard('pushoverSend');
        sendMessage
            .registerRunListener((args, state) => {
                if (typeof this.validation == 'undefined' || this.validation === 0) return new Error("Pushover api/token key not configured or valid under settings!");
                let tempUser = null;
                switch (args.target) {
                    case 'User':
                        tempUser = this.pushoverUser;
                        break;
                    case 'Group':
                        tempUser = this.pushoverGroup;
                        break;
                }
                let tempToken = this.pushoverToken;
                let pTitle = args.title;
                let pMessage = args.message;
                let pSound = args.sound;
                if (typeof pMessage == 'undefined' || pMessage == null || pMessage == '') return new Error("Message can not be empty");
                let pPriority = args.priority;
                let pRetry = args.retry;
                let pExpire = args.expire;
                return this.pushoverSend(tempUser, tempToken, pMessage, pTitle, pPriority, pRetry, pExpire, pSound);
            });
        let sendImage = this.homey.flow.getActionCard('pushoverSendImage');
        sendImage
            .registerRunListener((args, state) => {

                if (typeof this.validation == 'undefined' || this.validation === 0) return new Error("Pushover api/token key not configured or valid under settings!");
                let tempUser = null;
                switch (args.target) {
                    case 'User':
                        tempUser = this.pushoverUser;
                        break;
                    case 'Group':
                        tempUser = this.pushoverGroup;
                        break;
                }
                let tempToken = this.pushoverToken;
                let pTitle = args.title;
                let pMessage = args.message;
                let pSound = args.sound;
                let pPriority = args.priority;
                let pRetry = args.retry;
                let pExpire = args.expire;
                let image = args.droptoken;
                image.getBuffer()
                    .then(buf => {
                        return this.pushoverSend(tempUser, tempToken, pMessage, pTitle, pPriority, pRetry, pExpire, pSound, buf);
                    })
                    .catch(function (err) {
                        this.homey.error(err)
                    })
            })
    }

    // Send notification with parameters
    pushoverSend(pUser, pToken, pMessage, pTitle, pPriority, pRetry, pExpire, pSound, image) {
        let priority = 0;
        switch (pPriority) {
            case 'Normal':
                priority = 0;
                break;
            case 'Lowest':
                priority = -2;
                break;
            case 'Low':
                priority = -1;
                break;
            case 'High':
                priority = 1;
                break;
            case 'Emergency':
                priority = 2;
                break;
        }
        if (pToken !== "") {
            let p = new push({user: pUser, token: pToken,});
            let msg = {
                // These values correspond to the parameters detailed on https://pushover.net/api
                // 'message' is required. All other values are optional.
                message: pMessage,   // required
                title: pTitle,
                priority: priority,
                retry: pRetry,
                expire: pExpire,
                sound: pSound,
                attachment: image
            };
            p.send(msg, function (err, result) {
                if (err) {
                    throw err;
                }
                //Add send notification to Insights
                this.InsightEntry(1, new Date());
            });
        }
        return Promise.resolve()
    }

    InsightEntry(message, date) {
        this.homey.insights.getLog('pushover_sendNotifications').then(logs => {
            logs.createEntry(message, date).catch(err => {
                this.homey.error(err);
            });
        }).catch(err => {
            this.homey.log("Cannot Make insight entry")
        });
    }

    // Send notification with parameters
    pushoverSend_device(pUser, pToken, pMessage, pTitle, pDevice, pPriority, pRetry, pExpire, pSound, image) {
        let priority = 0;
        switch (pPriority) {
            case 'Normal':
                priority = 0;
                break;
            case 'Lowest':
                priority = -2;
                break;
            case 'Low':
                priority = -1;
                break;
            case 'High':
                priority = 1;
                break;
            case 'Emergency':
                priority = 2;
                break;
        }
        if (pToken !== "") {
            let p = new push({user: pUser, token: pToken,});

            let msg = {
                // These values correspond to the parameters detailed on https://pushover.net/api
                // 'message' is required. All other values are optional.
                message: pMessage,   // required
                title: pTitle,
                device: pDevice,
                priority: priority,
                retry: pRetry,
                expire: pExpire,
                sound: pSound,
                attachment: image
            };

            p.send(msg, function (err, result) {
                if (err) {
                    return Promise.reject(err);
                    //throw err;
                } else {
                    return Promise.resolve(result);
                }
            });
        }
        return Promise.resolve()
    }

    // Create Insight log
    createInsightlog() {
        let that = this;
        this.homey.insights.createLog('pushover_sendNotifications', {
            label: {
                en: 'Send Notifications'
            },
            type: 'number',
            units: {
                en: 'notifications'
            },
            decimals: 0
        }).then(function (err) {
            that.homey.log("Log Created")
        }).catch(function (err) {
            that.homey.log("Log Not created. " + err)
        });
    }

    buildPushoverArray() {
        this.account = null;
        this.account = this.homey.settings.get('pushoveraccount');

        if (this.account !== null) {
            this.pushoverUser = this.account['user'];
            this.pushoverGroup = this.account['group'];
            this.pushoverToken = this.account['token'];

            let url = "https://api.pushover.net/1/users/validate.json";

            let that = this;

            http.post(url, 'token=' + this.pushoverToken + '&user=' + this.pushoverUser).then(function (result) {
                if (result.response.statusCode === 200) {
                    that.request = JSON.parse(result.data);
                    that.devices = that.request.devices;
                    that.validation = that.request.status;

                    if (that.validation === 1) {
                        that.homey.log("Pushover - Account validated successful");
                        that.homey.log("Pushover - Listing devices: " + that.devices);
                        that.logValidation();
                    } else {
                        that.homey.log("Pushover - User and/or Token key invalid");
                    }
                } else if (result.response.statusCode === 400) {
                    that.homey.log("Pushover - User and/or Token key invalid");
                    that.validation = 0;
                    that.logValidation();
                }
            });

        } else {
            this.homey.log("Pushover - No account configured yet");
        }
    }

    searchForDevicesByValue(value) {
        var possibleDevices = this.devices;
        var tempItems = [];
        for (let i = 0; i < this.devices.length; i++) {
            const tempDevice = possibleDevices[i];
            this.homey.log("Checking device " + tempDevice + " if equal to " + value)
            if (tempDevice.indexOf(value) >= 0) {
                this.homey.log("found a partial match")
                tempItems.push({icon: "", name: tempDevice});
            }
        }
        return tempItems;
    }

    logValidation() {
        let validatedSuccess = "Validation successful"
        let validatedFailed = "Validation failed, bad user/api key!"
        if (this.validation === 1) {
            this.homey.settings.set('pushovervalidation', validatedSuccess);
        } else if (validation === "0") {
            this.homey.settings.set('pushovervalidation', validatedFailed);
        }
    }
}

module.exports = MyApp;

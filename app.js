'use strict';

const Homey = require('homey');
let push = require('pushover-notification-client');
let http = require('http.min');
let account = [];
let request = [];
let validation;
let devices = null;
let pushoverUser = null;
let pushoverGroup = null;
let pushoverToken = null;
let ledringPreference = false;
let InsightLog = null;

class MyApp extends Homey.App {
	onInit() {
        // Start building Pushover accounts array
		buildPushoverArray();
		createInsightlog();
		Homey.ManagerSettings.on('set', function (settingname) {
			if (settingname == 'pushoveraccount') {
				console.log('Pushover - Account has been changed/updated...');
				buildPushoverArray();
			}
		});

		let sendMessageDevice = new Homey.FlowCardAction('pushoverSend_device');
		sendMessageDevice
		    .register()
		    .registerRunListener(( args, state ) => {

                if (typeof validation == 'undefined' || validation == '0') return new Error("Pushover api/token key not configured or valid under settings!");
                let tempUser = pushoverUser;
                let tempToken = pushoverToken;
                let pMessage = args.message;
                let pTitle = args.title;
                let pSound = args.sound
                if (typeof pMessage == 'undefined' || pMessage == null || pMessage == '') return new Error("Message can not be empty");
                let pDevice = args.device.name;
                if (pDevice == null || pDevice == '') return new Error("No devices registered on this Pushover account!");
				let pPriority = args.priority;
				let pRetry = args.retry;
				if (typeof pRetry == 'undefined' || pRetry == null || pRetry == '') return new Error("Emergency Retry can not be empty");
				let pExpire = args.expire;
				if (typeof pExpire == 'undefined' || pExpire == null || pExpire == '') return new Error("Emergency Expire can not be empty");
				return pushoverSend_device(tempUser, tempToken, pMessage, pTitle, pDevice, pPriority, pRetry, pExpire, pSound);
				//return Promise.resolve();
		    })
		 	sendMessageDevice.getArgument('device').registerAutocompleteListener(( query, args ) => {
                 let deviceSearchString = query;
				 let items = searchForDevicesByValue(deviceSearchString);
				 console.log(items)
                 return Promise.resolve(items);
            });
			
        let sendMessage = new Homey.FlowCardAction('pushoverSend');
        sendMessage
            .register()
            .registerRunListener(( args, state ) => {

                if (typeof validation == 'undefined' || validation == '0') return new Error("Pushover api/token key not configured or valid under settings!");
				let tempUser = null;
				switch (args.target) {
					case 'User':
						tempUser = pushoverUser;
						break;
					case 'Group':
						tempUser = pushoverGroup;
						break;
				}
				let tempToken = pushoverToken;
				let pTitle = args.title;
                let pMessage = args.message;
                let pSound = args.sound;
                if (typeof pMessage == 'undefined' || pMessage == null || pMessage == '') return new Error("Message can not be empty");
				let pPriority = args.priority;
				let pRetry = args.retry;
				if (typeof pRetry == 'undefined' || pRetry == null || pRetry == '') return new Error("Emergency Retry can not be empty");
				let pExpire = args.expire;
				if (typeof pExpire == 'undefined' || pExpire == null || pExpire == '') return new Error("Emergency Expire can not be empty");
				return pushoverSend(tempUser, tempToken, pMessage, pTitle, pPriority, pRetry, pExpire, pSound);
                //return Promise.resolve();
                })
				
		let sendImage = new Homey.FlowCardAction('pushoverSendImage');
		sendImage
			.register()
			.registerRunListener(( args, state) => {

                if (typeof validation == 'undefined' || validation == '0') return callback(new Error("Pushover api/token key not configured or valid under settings!"));
				let tempUser = null;
				switch (args.target) {
					case 'User':
						tempUser = pushoverUser;
						break;
					case 'Group':
						tempUser = pushoverGroup;
						break;
				}
				let tempToken = pushoverToken;
				let pTitle = args.title;
				let pMessage = args.message;
				let pSound = args.sound;
				let pPriority = args.priority;
				let pRetry = args.retry;
				if (typeof pRetry == 'undefined' || pRetry == null || pRetry == '') return new Error("Emergency Retry can not be empty");
				let pExpire = args.expire;
				if (typeof pExpire == 'undefined' || pExpire == null || pExpire == '') return new Error("Emergency Expire can not be empty");
				let image = args.droptoken;
				image.getBuffer()
				.then( buf => {
                    //console.log(buf);
					return pushoverSend(tempUser, tempToken, pMessage, pTitle, pPriority, pRetry, pExpire, pSound, buf);
                })
				.catch (function(err){
					console.log(err)
				})
			})
		let sendImageDevice = new Homey.FlowCardAction('pushoverSendImageDevice');
		sendImageDevice
			.register()
			.registerRunListener(( args, state) => {

                if (typeof validation == 'undefined' || validation == '0') return callback(new Error("Pushover api/token key not configured or valid under settings!"));
				let tempUser = pushoverUser;
				let tempToken = pushoverToken;
				let pMessage = args.message;
				let pTitle = args.title;
				let pSound = args.sound;
				if (typeof pMessage == 'undefined' || pMessage == null || pMessage == '') return new Error("Message can not be empty");
                let pDevice = args.device.name;
                if (pDevice == null || pDevice == '') return new Error("No devices registered on this Pushover account!");
				let pPriority = args.priority;
				let pRetry = args.retry;
				if (typeof pRetry == 'undefined' || pRetry == null || pRetry == '') return new Error("Emergency Retry can not be empty");
				let pExpire = args.expire;
				if (typeof pExpire == 'undefined' || pExpire == null || pExpire == '') return new Error("Emergency Expire can not be empty");
				let image = args.droptoken;
				image.getBuffer()
				.then( buf => {
                    //console.log(buf);
					return pushoverSend_device(tempUser, tempToken, pMessage, pTitle, pDevice, pPriority, pRetry, pExpire, pSound, buf);
                })
				.catch (function(err){
					console.log(err)
				})
			})
			sendImageDevice.getArgument('device').registerAutocompleteListener(( query, args ) => {
                 let deviceSearchString = query;
				 let items = searchForDevicesByValue(deviceSearchString);
				 console.log(items)
                 return Promise.resolve(items);
            });
	}
}

// Send notification with parameters
function pushoverSend(pUser, pToken, pMessage, pTitle, pPriority, pRetry, pExpire, pSound, image) {
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
	if (pToken != "") {
		let p = new push({ user: pUser, token: pToken, });
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
		// console.log(`ID: ${pUser}, Token: ${pToken}, Message: ${pMessage}, Title: ${pTitle}, Priority: ${priority}, Retry: ${pRetry}, Expire: ${pExpire}, Sound: ${pSound}"`);
		p.send(msg, function (err, result) {
			if (err) {
				throw err;
			} else {
				if (ledringPreference == true) {
					LedAnimate("green", 3000);
				}
			}
			console.log(result);
			//Add send notification to Insights
			InsightEntry(1, new Date());
		});
	} else {
		if (ledringPreference == true) {
			LedAnimate("red", 3000);
		}
	}
	return Promise.resolve()
}

function InsightEntry(message, date)
{

	Homey.ManagerInsights.getLog('pushover_sendNotifications').then(logs => {
		logs.createEntry(message,date).catch( err => {
			console.error(err);
		});
	}).catch(err => {
	console.log("Cannot Make insight entry")
	});
}

// Send notification with parameters
function pushoverSend_device(pUser, pToken, pMessage, pTitle, pDevice, pPriority, pRetry, pExpire, pSound, image) {
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
	if (pToken != "") {
		let p = new push({ user: pUser, token: pToken, });

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
		// console.log(`Message: ${pMessage}, Title: ${pTitle}, Priority: ${priority}, Retry: ${pRetry}, Expire: ${pExpire}, Sound: ${pSound}"`);
		p.send(msg, function (err, result) {
			if (err) {
				return Promise.reject(err);
				//throw err;
			} else {
				return Promise.resolve(result);
				if (ledringPreference == true) {
					LedAnimate("green", 3000);
				}
			}
			console.log(result);
		});
	} else {
		if (ledringPreference == true) {
			LedAnimate("red", 3000);
		}
	}
	return Promise.resolve()
}

// Create Insight log
function createInsightlog() {

	Homey.ManagerInsights.createLog('pushover_sendNotifications', {
		label: {
			en: 'Send Notifications'
		},
		type: 'number',
		units: {
			en: 'notifications'
		},
		decimals: 0
	}).then(function (err){
	console.log("Log Created")
	}).catch(function (err)
{
	console.log("Log Not created. " + err)
});
}

function buildPushoverArray() {
	account = null;
	account = Homey.ManagerSettings.get('pushoveraccount');

	if (account != null) {
		pushoverUser = account['user'];
		pushoverGroup = account['group'];
		pushoverToken = account['token'];
		ledringPreference = account['ledring'];

		let url = "https://api.pushover.net/1/users/validate.json";

		http.post(url, 'token=' + pushoverToken + '&user=' + pushoverUser).then(function (result) {
			if (result.response.statusCode == "200") {
				request = JSON.parse(result.data);
				devices = request.devices;
				validation = request.status;

				if (validation == "1") {
					console.log("Pushover - Account validated successful");
					console.log("Pushover - Listing devices: " + devices);
					logValidation();
				} else {
					console.log("Pushover - User and/or Token key invalid");
				}
			} else if (result.response.statusCode == "400") {
				console.log("Pushover - User and/or Token key invalid");
				validation = "0";
				logValidation();
			}
		});

	} else {
		console.log("Pushover - No account configured yet");
	}
}
function searchForDevicesByValue ( value ) {
	var possibleDevices = devices;
	var tempItems = [];
	for (var i = 0; i < devices.length; i++) {
		var tempDevice = possibleDevices[i];
		console.log("Checking device " + tempDevice + " if equal to " + value)
		if ( tempDevice.indexOf(value) >= 0 ) {
			console.log("found a partial match")
			tempItems.push({ icon: "", name: tempDevice });
		}
	}
	return tempItems;
}

function logValidation() {
	let validatedSuccess = "Validation successful"
	let validatedFailed = "Validation failed, bad user/api key!"
	if (validation == "1") {
		Homey.ManagerSettings.set('pushovervalidation', validatedSuccess);
	} else if (validation == "0") {
		Homey.ManagerSettings.set('pushovervalidation', validatedFailed);
	}
}

module.exports = MyApp;

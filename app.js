'use strict';

const Homey = require('homey');
let push = require('pushover-notification-client');
let http = require('http.min');
let account = [];
let request = [];
let validation;
let devices = null;
let pushoverUser = null;
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
                let sound = args.sound
                if (typeof pMessage == 'undefined' || pMessage == null || pMessage == '') return new Error("Message can not be empty");
                let pDevice = args.device.name;
                if (pDevice == null || pDevice == '') return new Error("No devices registered on this Pushover account!");
                let pPriority = args.priority;
				return pushoverSend_device(tempUser, tempToken, pMessage, pDevice, pPriority, sound);
				//return Promise.resolve();
		    })
		    //.getArgument('to')
	        //.registerAutocompleteListener(( query, args ) => {
            //    let deviceSearchString = value.query;
            //    let items = searchForDevicesByValue(deviceSearchString);
            //    return Promise.resolve(null, items);
            //});
            let sendMessage = new Homey.FlowCardAction('pushoverSend');
            sendMessage
                .register()
                .registerRunListener(( args, state ) => {

                    if (typeof validation == 'undefined' || validation == '0') return new Error("Pushover api/token key not configured or valid under settings!");
                    let tempUser = pushoverUser;
                    let tempToken = pushoverToken;
                    let pMessage = args.message;
                    let sound = args.sound;
                    if (typeof pMessage == 'undefined' || pMessage == null || pMessage == '') return new Error("Message can not be empty");
                    let pPriority = args.priority;
                    return pushoverSend(tempUser, tempToken, pMessage, pPriority, sound);
                    //return Promise.resolve();
                })
                //.getArgument('to')
                //.registerAutocompleteListener(( query, args ) => {
                //   let deviceSearchString = value.query;
                //    let items = searchForDevicesByValue(deviceSearchString);
                //    return Promise.resolve(null, items);
                //});

		let sendImage = new Homey.FlowCardAction('pushoverSendImage');
		sendImage
			.register()
			.registerRunListener(( args, state) => {

                if (typeof validation == 'undefined' || validation == '0') return callback(new Error("Pushover api/token key not configured or valid under settings!"));
                let tempUser = pushoverUser;
                let tempToken = pushoverToken;
								let pMessage = args.message;
								let pPriority = args.priority;
                let image = args.droptoken;
				image.getBuffer()
				.then( buf => {
                    //console.log(buf);
					return pushoverSend(tempUser, tempToken, pMessage, pPriority, null, buf);
                })
				.catch (function(err){
					console.log(err)
				})

			})
			//.getArgument('to')
	        //.registerAutocompleteListener(( query, args ) => {
	        //    return Promise.resolve(chat_ids);
	        //});
	}

}


// Send notification with parameters
function pushoverSend(pUser, pToken, pMessage, pPriority, sound, image) {
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
	}
	if (pToken != "") {

		let p = new push({
			user: pUser,
			token: pToken,
		});

		let msg = {
			// These values correspond to the parameters detailed on https://pushover.net/api
			// 'message' is required. All other values are optional.
			message: pMessage,   // required
			title: "Homey",
			priority: priority,
			sound: sound,
			attachment: image
		};

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
function pushoverSend_device(pUser, pToken, pMessage, pDevice, pPriority, sound, image) {
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
	}
	if (pToken != "") {
		let p = new push({
			user: pUser,
			token: pToken,
		});

		let msg = {
			// These values correspond to the parameters detailed on https://pushover.net/api
			// 'message' is required. All other values are optional.
			message: pMessage,   // required
			title: "Homey",
			device: pDevice,
			priority: priority,
			sound: sound,
			attachment: image
		};

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

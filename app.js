"use strict";

var push = require('pushover-notifications');
var http = require('http.min');
var account = [];
var request = [];
var validation;
var devices = null;
var pushoverUser = null;
var pushoverToken = null;
var ledringPreference = false;

// Get accounts from homey settings page.
function buildPushoverArray() {
	account = null;
	account = Homey.manager('settings').get('pushoveraccount');

	if (account != null) {
		pushoverUser = account['user'];
		pushoverToken = account['token'];
		ledringPreference = account['ledring'];

		var url = "https://api.pushover.net/1/users/validate.json";

		http.post(url, 'token=' + pushoverToken + '&user=' + pushoverUser).then(function (result) {
			if(result.response.statusCode == "200"){
				request = JSON.parse(result.data);
				devices = request.devices;
				validation = request.status;

				if (validation == "1"){
					Homey.log("Pushover - Account validated successful");
					Homey.log("Pushover - Listing devices: " + devices);
					logValidation();
				} else {
					Homey.log("Pushover - User and/or Token key invalid");
				}
			} else if (result.response.statusCode == "400") {
				Homey.log("Pushover - User and/or Token key invalid");
				validation = "0";
				logValidation();
			}
		});

	} else {
	Homey.log("Pushover - No account configured yet");
	}
}

function logValidation() {
	var validatedSuccess = "Validation successful"
	var validatedFailed = "Validation failed, bad user/api key!"
	if (validation == "1") {
		Homey.manager('settings').set('pushovervalidation', validatedSuccess);
	} else if (validation == "0") {
		Homey.manager('settings').set('pushovervalidation', validatedFailed);
	}
}

Homey.manager('flow').on('action.pushoverSend', function( callback, args ){
	  if( typeof validation == 'undefined' || validation == '0') return callback( new Error("Pushover api/token key not configured or valid under settings!") );
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.message;
		var pPriority = args.priority;
		pushoverSend ( tempUser, tempToken, pMessage, pPriority);
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_device', function( callback, args ){
	  if( typeof validation == 'undefined' || validation == '0') return callback( new Error("Pushover api/token key not configured or valid under settings!") );
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.message;
		var pDevice = args.device.name;
		if( pDevice == null || pDevice == '') return callback( new Error("No devices registered on this Pushover account!") );
		var pPriority = args.priority;
		pushoverSend_device ( tempUser, tempToken, pMessage, pDevice, pPriority );
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_device.device.autocomplete', function( callback, value ) {
	var deviceSearchString = value.query;
	var items = searchForDevicesByValue( deviceSearchString );
	callback( null, items );
});


// Send notification with parameters
function pushoverSend ( pUser, pToken , pMessage, pPriority) {
	var priority = 0;
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
	if (pToken != ""){

	var p = new push( {
		user: pUser,
		token: pToken,
	});

	var msg = {
		// These values correspond to the parameters detailed on https://pushover.net/api
		// 'message' is required. All other values are optional.
		message: pMessage,   // required
		title: "Homey",
		priority: priority
	};

	p.send( msg, function( err, result ) {
		if ( err ) {
			throw err;
		} else {
			if (ledringPreference == true){
				LedAnimate("green", 3000);
			}
		}
		Homey.log( result );
	});
	} else {
		if (ledringPreference == true){
			LedAnimate("red", 3000);
		}
	}
}

// Send notification with parameters
function pushoverSend_device ( pUser, pToken , pMessage, pDevice, pPriority) {
	var priority = 0;
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
	if (pToken != ""){
	var p = new push( {
		user: pUser,
		token: pToken,
	});

	var msg = {
		// These values correspond to the parameters detailed on https://pushover.net/api
		// 'message' is required. All other values are optional.
		message: pMessage,   // required
		title: "Homey",
		device: pDevice,
		priority: priority
	};

	p.send( msg, function( err, result ) {
		if ( err ) {
			throw err;
		} else {
			if (ledringPreference == true){
				LedAnimate("green", 3000);
			}
		}
		Homey.log( result );
	});
	} else {
		if (ledringPreference == true){
			LedAnimate("red", 3000);
		}
	}
}

function searchForDevicesByValue ( value ) {
	var possibleDevices = devices;
	var tempItems = [];
	for (var i = 0; i < devices.length; i++) {
		var tempDevice = possibleDevices[i];
		if ( tempDevice.indexOf(value) >= 0 ) {
			tempItems.push({ icon: "", name: tempDevice });
		}
	}
	return tempItems;
}


function LedAnimate(colorInput, duration) {
Homey.manager('ledring').animate(
    // animation name (choose from loading, pulse, progress, solid)
    'pulse',

    // optional animation-specific options
    {

	   color: colorInput,
        rpm: 300 // change rotations per minute
    },

    // priority
    'INFORMATIVE',

    // duration
    duration,

    // callback
    function( err, success ) {
        if( err ) return Homey.error(err);

    }
);
}

var self = module.exports = {
	init: function () {

		// Start building Pushover accounts array
		buildPushoverArray();

		Homey.manager('settings').on( 'set', function(settingname){

			if(settingname == 'pushoveraccount') {
			Homey.log('Pushover - Account has been changed/updated...');
			buildPushoverArray();
		}
		});

	}
}

"use strict";

var push = require('pushover-notifications');
var request = require('request');
var account = [];
var validation = null;
var devices = null;
var pushoverUser = null;
var pushoverToken = null;

// Get accounts from homey settings page.
function buildPushoverArray() {
	account = null;
	account = Homey.manager('settings').get('pushoveraccount');
	
	if (account != null) {
	pushoverUser = account['user'];
	pushoverToken = account['token'];
	
	var url = "https://api.pushover.net/1/users/validate.json";
	
	request.post( url, {
        form: {
            'token': pushoverToken,
            'user': pushoverUser
        },
        json: true
    }, function( err, response, body ){
        if( err ) return callback(err);
        // If status is 200 - Ok
        if (body.status.code == 200) {
            // Return
            callback(body);
        }
        validation = body.status;
        devices = body.devices;
        
        if (validation == "1"){
		Homey.log("Pushover - Account validated successful");
		Homey.log("Pushover - Listing devices: " + devices);
	} else {
		Homey.log("Pushover - User and/or Token key invalid");
	}
    });
	} else {
	Homey.log("Pushover - No account configured yet");
	}
}

Homey.manager('flow').on('action.pushoverSend', function( callback, args ){
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.message;
		var pPriority = args.priority;
		pushoverSend ( tempUser, tempToken, pMessage, pPriority);
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_device', function( callback, args ){
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.message;
		var pDevice = args.device.name;
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
		LedAnimate("green", 3000);
		}
		Homey.log( result );
	});
	} else {
		LedAnimate("red", 3000);
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
		LedAnimate("green", 3000);
		}
		Homey.log( result );
	});
	} else {
		LedAnimate("red", 3000);
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

			Homey.log('Pushover - Account has been changed/updated...');
			buildPushoverArray();

		});

	}
}

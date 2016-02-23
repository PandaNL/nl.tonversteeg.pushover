"use strict";

var push = require('pushover-notifications');
var account = [];
var pushoverUser = null;
var pushoverToken = null;

// Get accounts from homey settings page.
function buildPushoverArray() {
	
	account = Homey.manager('settings').get('pushoveraccount');
	
	pushoverUser = account['user'];
	pushoverToken = account['token'];
}

Homey.manager('flow').on('action.pushoverSend_normal', function( callback, args ){
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.pushoverMessage_normal;
		var pPriority = 0;
		pushoverSend ( tempUser, tempToken, pMessage, pPriority);
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_lowest', function( callback, args ){
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.pushoverMessage_lowest;
		var pPriority = -2;
		pushoverSend ( tempUser, tempToken, pMessage, pPriority );
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_low', function( callback, args ){
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.pushoverMessage_low;
		var pPriority = -1;
		pushoverSend ( tempUser, tempToken, pMessage, pPriority );
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_high', function( callback, args ){
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.pushoverMessage_high;
		var pPriority = 1;
		pushoverSend ( tempUser, tempToken, pMessage, pPriority );
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_normal_device', function( callback, args ){
		var tempUser = pushoverUser;
		var tempToken = pushoverToken;
		var pMessage = args.pushoverMessage_normal_message;
		var pDevice = args.pushoverMessage_normal_device;
		var pPriority = 0;
		pushoverSend_device ( tempUser, tempToken, pMessage, pDevice, pPriority );
    callback( null, true ); // we've fired successfully
});


// Send notification with parameters
function pushoverSend ( pUser, pToken , pMessage, pPriority) {

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
		priority: pPriority
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
		priority: pPriority
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
        Homey.log("Animation played succesfully");
	
    }
);
}

var self = module.exports = {
	init: function () {

		// Star building Pushover accounts array
		buildPushoverArray();

		Homey.manager('settings').on( 'set', function(settingname){

			Homey.log('Pushover - Account has been changed/updated...');
			buildPushoverArray();

		});

	}
}

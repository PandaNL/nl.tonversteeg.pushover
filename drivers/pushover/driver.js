var push = require('pushover-notifications');

module.exports.pair = function( socket ) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function( data, callback ) {

		var devices = [{
			data: {
				id				: tempUser,
				pushoverUser : tempUser,
				pushoverToken : tempToken
			},
			name: 'Pushover user'
		}];

		callback( null, devices );

	});

	socket.on('get_devices', function( data, callback ) {

		// Set passed pair settings in variables
		tempUser = data.pushoverUser;
		tempToken = data.pushoverToken;

		socket.emit ( 'continue', null );

	});

	socket.on('disconnect', function(){
			console.log("Pushover - User aborted pairing, or pairing is finished");
	})

}


Homey.manager('flow').on('action.pushoverSend_normal', function( callback, args ){
		console.log("Pushover notification - user id "+args.device.id);
		tempUser = args.device.pushoverUser;
		tempToken = args.device.pushoverToken;
		console.log("Pushover notification - Token id "+tempToken);
		var pMessage_normal = args.pushoverMessage_normal;
		pushoverSend_normal ( tempUser, tempToken, pMessage_normal );
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_lowest', function( callback, args ){
		console.log("Pushover notification - user id "+args.device.id);
		tempUser = args.device.pushoverUser;
		tempToken = args.device.pushoverToken;
		console.log("Pushover notification - Token id "+tempToken);
		var pMessage_lowest = args.pushoverMessage_lowest;
		pushoverSend_lowest ( tempUser, tempToken, pMessage_lowest );
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_low', function( callback, args ){
		console.log("Pushover notification - user id "+args.device.id);
		tempUser = args.device.pushoverUser;
		tempToken = args.device.pushoverToken;
		console.log("Pushover notification - Token id "+tempToken);
		var pMessage_low = args.pushoverMessage_low;
		pushoverSend_low ( tempUser, tempToken, pMessage_low );
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_high', function( callback, args ){
		console.log("Pushover notification - user id "+args.device.id);
		tempUser = args.device.pushoverUser;
		tempToken = args.device.pushoverToken;
		console.log("Pushover notification - Token id "+tempToken);
		var pMessage_high = args.pushoverMessage_high;
		pushoverSend_high ( tempUser, tempToken, pMessage_high );
    callback( null, true ); // we've fired successfully
});

Homey.manager('flow').on('action.pushoverSend_normal_device', function( callback, args ){
		console.log("Pushover notification - user id "+args.device.id);
		tempUser = args.device.pushoverUser;
		tempToken = args.device.pushoverToken;
		console.log("Pushover notification - Token id "+tempToken);
		var pMessage_normal = args.pushoverMessage_normal_message;
		var pDevice = args.pushoverMessage_normal_device;
		pushoverSend_normal_device ( tempUser, tempToken, pMessage_normal, pDevice );
    callback( null, true ); // we've fired successfully
});

function pushoverSend_normal ( pUser, pToken , pMessage_normal) {
var p = new push( {
    user: pUser,
    token: pToken,
    // onerror: function(error) {},
    // update_sounds: true // update the list of sounds every day - will
    // prevent app from exiting.
});

var msg = {
    // These values correspond to the parameters detailed on https://pushover.net/api
    // 'message' is required. All other values are optional.
    message: pMessage_normal,   // required
    title: "Homey",
    priority: 0
};

p.send( msg, function( err, result ) {
    if ( err ) {
        throw err;
    }

    console.log( result );
});
}

function pushoverSend_normal_device ( pUser, pToken , pMessage_normal, pDevice) {
var p = new push( {
    user: pUser,
    token: pToken,
    // onerror: function(error) {},
    // update_sounds: true // update the list of sounds every day - will
    // prevent app from exiting.
});

var msg = {
    // These values correspond to the parameters detailed on https://pushover.net/api
    // 'message' is required. All other values are optional.
    message: pMessage_normal,   // required
    title: "Homey",
    device: pDevice,
    priority: 0,
};

p.send( msg, function( err, result ) {
    if ( err ) {
        throw err;
    }

    console.log( result );
});
}

function pushoverSend_lowest ( pUser, pToken , pMessage_lowest) {
var p = new push( {
    user: pUser,
    token: pToken,
    // onerror: function(error) {},
    // update_sounds: true // update the list of sounds every day - will
    // prevent app from exiting.
});

var msg = {
    // These values correspond to the parameters detailed on https://pushover.net/api
    // 'message' is required. All other values are optional.
    message: pMessage_lowest,   // required
    title: "Homey",
    priority: -2
};

p.send( msg, function( err, result ) {
    if ( err ) {
        throw err;
    }

    console.log( result );
});
}

function pushoverSend_low ( pUser, pToken , pMessage_low) {
var p = new push( {
    user: pUser,
    token: pToken,
    // onerror: function(error) {},
    // update_sounds: true // update the list of sounds every day - will
    // prevent app from exiting.
});

var msg = {
    // These values correspond to the parameters detailed on https://pushover.net/api
    // 'message' is required. All other values are optional.
    message: pMessage_low,   // required
    title: "Homey",
    priority: -1
};

p.send( msg, function( err, result ) {
    if ( err ) {
        throw err;
    }

    console.log( result );
});
}

function pushoverSend_high ( pUser, pToken , pMessage_high) {
var p = new push( {
    user: pUser,
    token: pToken,
    // onerror: function(error) {},
    // update_sounds: true // update the list of sounds every day - will
    // prevent app from exiting.
});

var msg = {
    // These values correspond to the parameters detailed on https://pushover.net/api
    // 'message' is required. All other values are optional.
    message: pMessage_high,   // required
    title: "Homey",
    priority: 1
};

p.send( msg, function( err, result ) {
    if ( err ) {
        throw err;
    }

    console.log( result );
});
}

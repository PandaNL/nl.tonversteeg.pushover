var request = require('request')
var https = require('https')
var http = require('http')
var url = require('url')
var qs = require('querystring')
var fs = require('fs');
var os = require('os')
var FormData = require('form-data');
var pUrl = 'https://api.pushover.net/1/messages.json'
//var pUrl = 'https://httpbin.org/post'

function setDefaults(o) {
  var def = [
    'device',
    'title',
    'url',
    'url_title',
    'priority',
    'timestamp',
    'sound'
  ]

  var i = 0
  var l = def.length
  for (; i < l; i++) {
    if (!o[def[i]]) {
      o[def[i]] = ''
    }
  }

  return o
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function Pushover(opts) {
  var self = this
  this.token = opts.token
  this.user = opts.user
  this.httpOptions = opts.httpOptions
  this.sounds = {
    'pushover': 'Pushover (default)',
    'bike': 'Bike',
    'bugle': 'Bugle',
    'cashregister': 'Cash Register',
    'classical': 'Classical',
    'cosmic': 'Cosmic',
    'falling': 'Falling',
    'gamelan': 'Gamelan',
    'incoming': 'Incoming',
    'intermission': 'Intermission',
    'magic': 'Magic',
    'mechanical': 'Mechanical',
    'pianobar': 'Piano Bar',
    'siren': 'Siren',
    'spacealarm': 'Space Alarm',
    'tugboat': 'Tug Boat',
    'alien': 'Alien Alarm (long)',
    'climb': 'Climb (long)',
    'persistent': 'Persistent (long)',
    'echo': 'Pushover Echo (long)',
    'updown': 'Up Down (long)',
    'none': 'None (silent)'
  }

  if (opts.debug) {
    this.debug = opts.debug
  }

  if (opts.onerror) {
    this.onerror = opts.onerror
  }

  if (opts.update_sounds) {
    self.updateSounds()
    setInterval(function () {
      self.updateSounds()
    }, 86400000)
  }
}

Pushover.prototype.errors = function (d, res) {
  if (typeof d === 'string') {
    d = JSON.parse(d)
  }

  if (d.errors) {
    if (this.onerror) {
      this.onerror(d.errors[0], res)
    } else {
      throw new Error(d.errors[0], res)
    }
  }
}

Pushover.prototype.updateSounds = function () {
  var self = this
  var data = ''
  var surl = 'https://api.pushover.net/1/sounds.json?token=' + self.token
  var req = https.request(url.parse(surl), function (res) {
    res.on('end', function () {
      var j = JSON.parse(data)
      self.errors(data, res)
      self.sounds = j.sounds
    })

    res.on('data', function (chunk) {
      data += chunk
    })
  })

  req.on('error', function (e) {
    self.errors(e)
  })

  req.write('')
  req.end()
}

Pushover.prototype.send = function (obj, fn) {
  var self = this
  obj = setDefaults(obj)

  var options = {
    uri: pUrl,
    method: "POST",
  }
  //console.log(obj)

  var r = request(options, function (error, response, body) {
    console.log(body);
  });
  
  //var message = replaceAll(obj.message, '\\n', os.EOL)
  var message = obj.message.split('\\n').join(os.EOL);
  console.log(message)
  var form = r.form();
  //var form = new FormData();
  form.append('token', self.token || obj.token);
  form.append('user', self.user || obj.user);
  form.append('message', message);
  form.append('sound', obj.sound);
  form.append('title', obj.title);
  if (obj.attachment != null) {//console.log("Sending image buffer: " + obj.attachment)
    form.append('attachment', obj.attachment, { filename: 'unicycle.png' });
  }
}
exports = module.exports = Pushover

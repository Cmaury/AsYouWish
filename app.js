var express = require('express');
var app = express();
http  = require("http");
var speak = require('node-speak');
var yelp = require('./yelp_config.js').yelpKeys;
var fs = require('fs')

var audio = "";

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
	res.render ('HelloWorld.jade');
});


app.get('/yelp/*', function(req, res) {
	var error = 'Invalid API call';
	var query = req.params[0];
	query = JSON.parse(query);
	console.log(query);
	if (query.ll) {delete query['cll']};
	if (Object.keys(query).length > 4) {
		console.log(query);
		yelp.search(query, function(error, data) {
		error = error;
		res.send(200, JSON.stringify(data));
		res.end();
	});
	}
	else {
		res.send(500, JSON.stringify(error));
		res.end();
	}
});

//iSpeech Request setup

var iSpeech_options = {
	host: 'api.ispeech.org',
	port: '80',
	path: '/api/rest?',
	method: 'POST',
	headers: {
		'Content-Type' : 'application/json'
	}	
}

var iSpeech_req = http.request(iSpeech_options, function(res){
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	//res.setEncoding('utf8');
	body = ''
	res.on('data', function (chunk) {
		body += chunk
		console.log('BODY: ' + chunk);
	})
	res.on('end', function (){
		res.send(200, body)
	})
})

iSpeech_req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
  iSpeech_req.end()
});


/*
app.get('/test/*', function(req, res) {
	var iSpech_string = {
		apikey: '64942b46a036bf4379f556734042333a',
		action: 'convert',
		text: req.query.string,
		voice: 'usenglishfemale',
		speed: '0'
	}
	iSpeech_req.write(JSON.stringify(iSpech_string))
	iSpeech_req.end()
});
*/

app.get('/read/*', function(req, response) {
	var text = req.query.text
	var speed = req.query.speed
	var iSpeech_string = 'http://api.ispeech.org/api/rest?apikey=64942b46a036bf4379f556734042333a&action=convert&text=' + text + '&voice=usenglishfemale&speed=' + speed
	console.log(iSpeech_string)
	var filename = Math.random().toString(36).substring(7) + '.mp3'
	http.get(iSpeech_string, function(res){
		audio = ''
		res.setEncoding('binary')
		res.on('data', function(src){
			audio += src
		})
		res.on('end',function() {
			fs.writeFile('public/'+ filename, audio, 'binary', function(err){
				if(err) throw err;
				response.send(200, filename)
				response.end()
			})
		})
	}).on('error', function(e) {
  		console.log("Got error: " + e.message);
		})
	//	console.log("is this audio or an object" + audio)
});	

//Speech.js call
app.get('/test/*', function(req, res) {
	var string = req.query.text;
	var speed = parseInt(req.query.speed,10);

	console.log('server received: ' + string + speed);
	speak(string, /*{'speed': speed},*/ {
		callback: function(src){
		audio = src;
		res.send(200, audio);
		res.end();
	}});
});

app.listen(3000);
console.log('Listening on port 3000');
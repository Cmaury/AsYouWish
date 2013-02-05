var express = require('express');
var app = express();
http  = require("http");
var speak = require('node-speak')
var yelp = require('./yelp_config.js').yelpKeys

var audio = "";

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
	res.render ('HelloWorld.jade')
})


app.get('/yelp/*', function(req, res) {
	var error = 'Invalid API call'
	var query = req.params[0]
	query = JSON.parse(query)
	console.log(query)
	if (query.ll) {delete query['cll']}
	if (Object.keys(query).length > 4) {
		console.log(query)
		yelp.search(query, function(error, data) {
		error = error
		res.send(200, JSON.stringify(data))
		res.end()
	})
	}
	else {
		res.send(500, JSON.stringify(error))
		res.end()
	}
})

app.get('/read/*', function(req, res) {
	var string = req.query.string
	var speed = parseInt(req.query.speed)
	console.log('server received: ' + string + speed)
	speak(string, /*{'speed': speed},*/ {
		callback: function(src){
		audio = src
		res.send(200, audio)
		res.end()	
	}})
})

app.listen(3000);
console.log('Listening on port 3000');
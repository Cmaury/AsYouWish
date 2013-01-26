var express = require('express');
var app = express();
var yelp = require("yelp").createClient({
  consumer_key: "63Eg53GxgDQv6ZmfbOcHFw", 
  consumer_secret: "PhHBgCAK3tAmi5xy3N-eZb0ypB4",
  token: "7BLMSkIkBPImpxnDpuOT-28sY0mp_Num",
  token_secret: "2sgNndyYrJM5aL6X64e8KOHpzW0"
});

app.locals({yelp:yelp})

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
	console.log(typeof(query))
	if (Object.keys(query).length > 2) {
		console.log('query is an object')
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

app.listen(3000);
console.log('Listening on port 3000');
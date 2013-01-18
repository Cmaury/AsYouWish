var express = require('express');
var app = express();
//var html = require('html');

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
	res.render ('HelloWorld.jade')
})

app.listen(3000);
console.log('Listening on port 3000');
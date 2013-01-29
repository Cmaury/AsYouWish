//Location Commands
var speak = require("node-speak");


var Sort = new Object();
Sort.str = "sort"
Sort.param = "sort"
Sort.commands = []
Sort.special = true
Sort.dict = {
	'best match': 0,
	'highest rated': 1,
	'distance': 2
}

// Global Commands
var Category = new Object();
Category.str = 'Category'
Category.param = "category_filter"
Category.special = true
Category.commands = [
	Sort,
	Location
]

var Location = new Object();
Location.str = "location"
Location.param = "location"
Location.special = false
Location.commands = [
	Category,
	Sort
]
var Search = new Object();
Search.str = "search"
Search.param = "term"
Search.special = false
Search.commands = [
	Location,
	Sort,
	Category
]

var commandList = [
	Search,
	Category
]

//other variables
var commands = '';
var recognizing;
var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
reset();
commandFind();
recognition.onend = reset;
var guessed_location = '';
var commandThread = {
	'category_filter' : 'restaurants',  //set search degaults
	'location' : guessed_location
};
var api_URL = '/yelp/'
var results = ''


//UI logic: Starting and stopping recognition

recognition.onresult = function (event) {
	var final = '';
	var interim = '';
	for (var i = 0; i < event.results.length; i++) {
		if (event.results[i].isFinal) {
			final += event.results[i][0].transcript;
			commands = commandFind(final, commandList);
			commandParse(commands);

		}
		else {
			interim += event.results[i][0].transcript;

		} 

	}
	final_span.innerHTML = final;
	interim_span.innerHTML = interim;
	commandExecute(commandThread)
	
}  

function reset() {
	recognizing = false;
	button.innerHTML = 'Click to Speak';
	image_src.src = 'images/mic.gif';
}

function toggleStartStop() {
	if (recognizing) {
		recognition.stop();
		reset();
	}
	else {
		recognition.start();
		recognizing = true;
		button.innerHTML = 'Click to Stop';
		image_src.src = 'images/mic-animate.gif';
		final_span.innerHTML = '';
		interim_span.innerHTML = '';
		//results_span = '';

	}
}
////Command Parsing and execution logic

//Searches input string against list of cammandsand returns array of command + substring
function commandFind(event, commandList) {	
	if (typeof(event) != "undefined"  && typeof(commandList) != "undefined") {
		for (var i = 0; i < commandList.length; i++) {
			commandIndex = event.search(commandList[i].str.toLowerCase())
			if (commandIndex != -1) {
				input = event.substr(0,commandIndex)
				command_next = commandList[i]; //This is an object
				substring = event.substr(commandIndex+commandList[i].str.length)
				result = [input, command_next, substring]
				return result
			}
			else return [event] //if no command found treats string as input for previous command (if any)
		}
	}
	return [event] 
};

//Separates compound commands from initial input
function commandParse(array) {
	if (array[1] == undefined) return array //no command found	
	else {
		command_current = array[1]
		substring = array[2]
		parsed = commandFind(substring, command_current.commands) 
		input = parsed[0].trim()
		console.log('pre translated ' + input)
		input = commandTranslate(command_next, input)
		console.log('translated' + input)
		commandThread[command_current.param] = input
		commandParse(parsed)
	}
}

//executes individual commands
function commandExecute(query) {
	 //takes text input and replaces it with API specific 
	query =  JSON.stringify(query)
	console.log(query)
	$.ajax(api_URL + query, {
		type: 'GET',
		dataType: 'JSON',
		success: function(data) { 
			console.log(data)
			results = data
			for (var i = 0; i < Object.keys(results.businesses).length; i++) {
			results_span.innerHTML += results.businesses[i].name + ' - Rating:'
			results_span.innerHTML += results.businesses[i].rating + ' stars. <br>'
			}	
		},
    	error  : function()     {console.log('error') }
	})
};

function commandTranslate(command, input) {
	if (command_current.special == true) {
		if (command.str == 'category') {
			input = input.replace(/\s+/g, '').toLowerCase()
			console.log('cleaned input' + input)
			return input
		}
		else {
			if (input in Sort.dict) {
				input = Sort.dict[input]
				console.log(Sort.dict[input])	
			return input
		}
			else return ''
		}
	}
	else return input
}


//Error and edgecase logic

if (!('webkitSpeechRecognition' in window)) {
	alert('This Demo requires Chrome version 25 or higher. Please switch browsers before continuing.')
}
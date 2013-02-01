//Global Commands
var Start = {
	'str': 'start',
	'param' : 'start',
	'action': function(input) {
		audio.play()
		return
	},
	'commands': [
	],
	'help': 'Start - Begin reading a section of text.  '
}

var Stop = {
	'str': 'stop',
	'param' : 'stop',
	'action': function(input) {
		audio.pause()
		console.log("audio stopped?")
		return
	 },
	'commands': [
	],
	'help': 'Stop - Stop reading a section of text.  '
}

var Faster = {
	'str': 'faster',
	'param' : 'faster',
	'action': '',
	'commands': [
	],
	'help': 'Faster - Increase the the reading speed by 5 words per minute.  '
}

var Slower = {
	'str': 'slower',
	'param' : 'slower',
	'action': '',
	'commands': [
	],
	'help': 'Slower - Decrease the reading speed by 5 words per minute.  '
}

var Rate = {
	'str': 'rate',
	'param' : 'rate',
	'action': '',
	'commands': [
	],
	'help': 'Rate - Set the reading speed to a specific rate, measured in words per minute.  '
}


//Yelp Commands
var Sort = {
	'str': 'sort',
	'param': 'sort',
	'action': function (input) {
		console.log('sort input ' + input)
		if (input in Sort.dict) {
			input = Sort.dict[input]
			console.log(Sort.dict[input])	
			return input
		}
		else return ''
	},
	'commands': [
	],
	'dict': {
	'best match': 0,
	'highest rated': 1,
	'distance': 2
	},
	'help': 'Sort - Sort the search results from Yelp.com based on: Best match, Distance, and Rating.  '
}


var Category = {
	'str': 'category',
	'param': 'category_filter',
	'action': '',
	'commands': [
		Sort,
		Location,
	],
	'help': 'Category - Specify which type of business you would like to search for. The defualt category is Restaurants.  '
}

var Location = {
	'str': 'location',
	'param': 'location',
	'action': '',
	'commands': [
		Category,
		Sort,
	],
	'help': 'Location - Specify which area you would like to search within. Example values: Philadelphia, Mission San Francisco, East Village. '
}
var Search = {
	'str': 'search',
	'param': 'search',
	'action': '',
	'commands': [
		Category,
		Location,
		Sort
	],
	'help': 'Search - Specify what you would like to search for. Example values: Dinner, Chinese, McDonald\'s. '
}

var Help = {
	'str': 'help',
	'param': null,
	'list': [],
	'commands': [],
	'action': function() {
		var helplist = ''
		for (var i = 0; i < Help.list.length; i++) {
		helplist += Help.list[i]
		}
		voiceSynth(helplist)
		},
	'help': 'Help - List all currently available commands.  '
}

var commandList = {
	'str': 'commandList',
	'commands': [
		Search,
		Category,
		Location,
		Sort,
		//yelpCommands - Need to separate out commands coming in from individual app
		Start,
		Stop,
		Faster,
		Slower,
		Rate,
		Help
	]
}

for (var i = 0; i < commandList.commands.length; i++) {
	commandList.commands[i].commands.push(commandList)
	Help.list.push(commandList.commands[i].help)
};


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
	'location' : guessed_location,
	'limit' : 5	
};
var api_URL = '/yelp/'
var results = ''
var speed = 175


//UI logic: Starting and stopping recognition

window.onload = voiceSynth(welcome.innerHTML)

recognition.onresult = function (event) {
	var final = '';
	var interim = '';
	for (var i = 0; i < event.results.length; i++) {
		if (event.results[i].isFinal) {
			final += event.results[i][0].transcript;
			commands = commandFind(final, commandList.commands);
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
	commandThread = {
	'category_filter' : 'restaurants',  //set search degaults
	'location' : guessed_location,
	'limit' : 5	
};
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
function commandFind(string, list) {	
	console.log(list)
	if (typeof(string) != "undefined"  && typeof(list) != "undefined") {
		for (var i = 0; i < list.length; i++) {
			console.log(list[i])
			commandIndex = string.search(list[i].str.toLowerCase())
			if (commandIndex != -1) {
				input = string.substr(0,commandIndex)
				command_next = list[i]; //This is an object
				console.log('command  next is '+typeof(command_next))				
				substring = string.substr(commandIndex+list[i].str.length)
				console.log('substring '+substring)
				result = [input, command_next, substring]
				console.log('result '+result)
				return result
			}
		}
		return [string]
	}
	return [string]
};

//Separates compound commands from initial input
function commandParse(array) {
	if (array[1] == undefined) {console.log('no command' + array)}	
	else {
		console.log('parsed '+ array)
		command_current = array[1]
		substring = array[2]
		parsed = commandFind(substring, command_current.commands) 
		input = parsed[0].trim()
		input = commandTranslate(command_next, input)
		commandThread[command_current.param] = input
		commandParse(parsed)
	}
}

//executes individual commands
function commandExecute(query) {
	 //takes text input and replaces it with API specific 
	if (typeof(query) == 'object' && Object.keys(query).length > 3) {	
		console.log(Object.keys(query)) 
		query =  JSON.stringify(query)
		$.ajax(api_URL + query, {
		type: 'GET',
		dataType: 'JSON',
		success: function(data) { 
			console.log(data)
			results = data
			for (var i = 0; i < Object.keys(results.businesses).length; i++) {
			results_span.innerHTML += results.businesses[i].name + ' - Rating:'
			results_span.innerHTML += results.businesses[i].rating + ' stars. \n'
			}
			voiceSynth(results_span.innerHTML)	
		},
    	error: function(xhr, ajaxOptions, thrownError) {
			console.log(xhr)
			console.log(ajaxOptions)
			console.log(thrownError)
			}
		})
	};
	
};


//input translation should happen as part of the command definition
//ex. Sort.translate('distance') returns 2
function commandTranslate(command, input) {
	console.log('translate ' + command.str + input)
	if (command.str == 'category') {
		input = input.replace(/\s+/g, '').toLowerCase()
		console.log('cleaned input' + input)
		return input
	}
	if (command.str == 'sort') {
		return Sort.action(input)
	}
	if (command.str == 'stop') {
		console.log('stop')
		Stop.action(input)
	}
	if (command.str == 'start') {
		console.log('start')
		Start.action(input)
	}
	if (command.str == 'faster') {
		console.log('faster')
		Faster.action(input)
	}
	if (command.str == 'slower') {
		console.log('slower')
		Slower.action(input)
	}
	if (command.str == 'rate') {
		console.log('rate')
		Rate.action(input)
	}
	if (command.str == 'help') {
		console.log('help')
		Help.action(input)
	}				
	else {
		return input
	}

}


function voiceSynth (string) {
	console.log('synth called on ' + string)
	$.ajax('read/?string=' + string + '&speed=' + speed, {
		type: 'GET',
		success: function(src) {
			audio.setAttribute('src', src)
			audio.play()
		},
		error: function(xhr, ajaxOptions, thrownError) {
			console.log(xhr)
			console.log(ajaxOptions)
			console.log(thrownError)
			}
	})
}


//Error and edgecase logic

if (!('webkitSpeechRecognition' in window)) {
	alert('This Demo requires Chrome version 25 or higher. Please switch browsers before continuing.')
}
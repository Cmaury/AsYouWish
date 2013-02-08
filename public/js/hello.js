//Global Commands
var Start = {
	'str': 'start',
	'param' : 'start',
	'action': function(input) {
		audio.play()
		voiceCleanup()
		return ''
	},
	'commands': [
	],
	'help': 'Start - Begin reading a section of text.  '
}

var Stop = {
	'str': 'stop',
	'param' : 'stop',
	'action': function(input) {
		audioPause()
		return ''
	 },
	'commands': [
	],
	'help': 'Stop - Stop reading a section of text.  '
}

var More = {
	'str': 'more',
	'param' : 'more',
	'action': function(input) {
		voiceQueue = []
		audio.setAttribute('src', '')
		return ''
	 },
	'commands': [
	],
	'help': 'More - Hear more information about the current result.  '
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
	],
	'help': 'Category - Specify which type of business you would like to search for. The default category is Restaurants.  '
}

var Location = {
	'str': 'location',
	'param': 'location',
	'action': function (input) {
		console.log('location1 '+ input)
		input = input.replace(/s /,'')
		console.log('location2 '+ input)
		delete commandThread['ll']
		return input
	},
	'commands': [
	],
	'help': 'Location - Specify which area you would like to search within. Example values: Philadelphia, Mission San Francisco, East Village. '
}
var Search = {
	'str': 'search',
	'param': 'term',
	'action': function(input) {
		audio.setAttribute('src', '')
		return input
	},
	'commands': [
	],
	'help': 'Search - Specify what you would like to search for. Example values: Dinner, Chinese, McDonald\'s. '
}

var Help = {
	'str': 'help',
	'param': null,
	'list': [],
	'commands': [],
	'action': function() {
		for (var i = 0; i < Help.list.length;i++) {
			//setTimeout(voiceSynth(Help.list[i],null), 2000)
			voiceSynth(Help.list[i],null)
		}},
	'help': 'Help - List all currently available commands.  '
}

var commandList = {
	'str': 'commandList',
	'commands': [
		Search,
		Category,
		Location,
		Sort,
		More,
		//yelpCommands - Need to separate out commands coming in from individual app
		Start,
		Stop,
		Faster,
		Slower,
		Rate,
		Help
	]
}


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
var commandThreadDefault = {
	'category_filter' : 'restaurants',  //set search degaults
	'location' : guessed_location,
	'limit' : 5	,
	'radius_filter': 500
};
var commandThread = commandThreadDefault
var locationString = ''
var api_URL = '/yelp/'
var results = ''
var speed = 175
var voiceBusy = false
var voiceQueue = []
var voiceCursor = null
var voiceInt


//Initial set up
for (var i = 0; i < commandList.commands.length; i++) {
	commandList.commands[i]['commands'] = commandList.commands[i]['commands'].concat(commandList.commands)
	Help.list.push(commandList.commands[i].help)
};

//window.onload = voiceSynth(welcome.innerHTML, null)
window.onload = navigator.geolocation.getCurrentPosition(setLocation, errorLocation)



//logic for setting user location
function setLocation(input) {
	var latitude = input.coords.latitude
	var longitude = input.coords.longitude
	var accuracy = input.coords.accuracy
	var locationString = latitude +','+longitude
	commandThread['ll'] = locationString+','+accuracy
	commandThread['cll'] = locationString
}

function errorLocation(input) {
	console.log('Error finding location')
	voiceSynth('We could not find your location. Please say your location when submitting your search. For example "search bars location san francisco."',null)
}


//UI logic: Starting and stopping recognition
recognition.onresult = function (event) {
	var final = '';
	var interim = '';
	for (var i = 0; i < event.results.length; i++) {
		if (event.results[i].isFinal) {
			final += event.results[i][0].transcript;
			commands = commandFind(final, commandList.commands);
			commandParse(commands);
			event.results.length = 0
		}
		else {
			interim += event.results[i][0].transcript;
			audioPause()

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
	commandThread = commandThreadDefault
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

	}
}
////Command Parsing and execution logic

//Searches input string against list of cammandsand returns array of command + substring
function commandFind(string, list) {
	//console.log("did it clean up "+ input + ', '+ command_current+ ', ' + command_next+ ', ' + substring+ ', ' +result)	
	if (typeof(string) != "undefined"  && typeof(list) != "undefined") {
		for (var i = 0; i < list.length; i++) {
			commandIndex = string.search(list[i].str.toLowerCase())
			if (commandIndex != -1) {
				input = string.substr(0,commandIndex)
				command_next = list[i]; //This is an object
				substring = string.substr(commandIndex+list[i].str.length)
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
	//Remove empty params in Query
	for (var i = 0; i < Object.keys(query).length; i++) {
	 	if(commandThread[Object.keys(query)[i]] == "") {
			delete commandThread[Object.keys(query)[i]]
		}}
	if (Object.keys(query).length > 4 && query.term) {	
		console.log(Object.keys(query)) 
		query =  JSON.stringify(query)
		$.ajax(api_URL + query, {
		type: 'GET',
		dataType: 'JSON',
		success: function(data) { 
			commandThread = commandThreadDefault
			console.log(data)
			results = data
			voiceSynth('There are '+ results.total + ' results for ' + commandThread.term + '.', null)
			for (var i = 0; i < Object.keys(results.businesses).length; i++) {
				name = results.businesses[i].name + ' - Rating - '
				rating = results.businesses[i].rating + ' stars. '
				//neighborhood = results.business[i].location.neighborhoods[0] + '.' :neighborhoods is undefined for some reason
				voiceSynth(name + rating, results.businesses[i].name)
			}
		},
    	error: function(xhr, ajaxOptions, thrownError) {
			console.log(xhr)
			console.log(ajaxOptions)
			console.log(thrownError)
			}
		})
	};
	
};

function voiceSynth (string, name) {
	if(voiceQueue.indexOf(string)== -1){
		voiceQueue.push(string)	
		voiceQueue.push(name)
	}		
	  for (var i = 0; i < voiceQueue.length/2; i++) {
		if (voiceBusy == false && audio.paused == true) {	
			voiceCall.call(undefined, voiceQueue.shift(),voiceQueue.shift())
		}
	}
}
function voiceCall (string, name) {
	voiceBusy = true
	console.log('synth called on ' + string)
	$.ajax('read/?string=' + string + '&speed=' + speed, {
		type: 'GET',
		success: function(src) {
			audio.setAttribute('src', src)	
			audio.play()
			voiceBusy = false
			voiceCursor = name
			//voiceCleanup()	
		},
		error: function(xhr, ajaxOptions, thrownError) {
			console.log(xhr)
			console.log(ajaxOptions)
			console.log(thrownError)
			}
	})
}

//check for unread items
function voiceCleanup() {
		while (voiceQueue.length > 1) {
		voiceSynth.call(undefined, voiceQueue.shift(),voiceQueue.shift())
	}
	/*var voiceInt = setInterval(function() {
		if (voiceQueue.length == 0) {clearInterval(voiceInt)}
		if (voiceQueue.length > 1 && audio.paused == true) {
			console.log('this should not fire.')
			voiceSynth.call(undefined, voiceQueue.shift(),voiceQueue.shift())}
},50) */
}

//voiceCleanup()

function audioPause() {
	audio.pause()
	clearInterval(voiceInt)
}

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
	if (command.str == 'location') {
		console.log('location action called')
		return Location.action(input)
	}
	if (command.str == 'more') {
		console.log('more action called')
		return More.action(input)
	}
	if (command.str == 'search') {
		console.log('search action called')
		return Search.action(input)
	}						
	else {
		return input
	}

}


//Error and edgecase logic

if (!('webkitSpeechRecognition' in window)) {
	alert('This Demo requires Chrome version 25 or higher. Please switch browsers before continuing.')
}
//Global Commands
var Start = {
	'str': 'start',
	'param' : 'start',
	'action': function (input) {
		audio.play();
		voiceBusy = true;
		voiceCleanup();
		return '';
	},
	'commands': [
	],
	'help': 'Start - Begin reading a section of text.  '
};

var Stop = {
	'str': 'stop',
	'param' : 'stop',
	'action': function (input) {
		audioPause();
		return '';
	},
	'commands': [
	],
	'help': 'Stop - Stop reading a section of text.  '
};

var More = {
	'str': 'more',
	'param' : 'more',
	'action': function (input) {
		commandThread = new commandThreadDefault();
		voiceQueue = [];
		console.log('cursor is ' + voiceCursor.name);
		audio.setAttribute('src', '');
		playTone('loading.wav');
		more_text = yelpMore(voiceCursor);
		for (var i = 0; i < yelpMore.length; i++) {
			voiceSynth(more_text, voiceCursor);
		}
		return '';
	},
	'commands': [
	],
	'help': 'More - Hear more information about the current result.  '
};


var Faster = {
	'str': 'faster',
	'param' : 'faster',
	'action': '',
	'commands': [
	],
	'help': 'Faster - Increase the the reading speed by 5 words per minute.  '
};

var Slower = {
	'str': 'slower',
	'param' : 'slower',
	'action': '',
	'commands': [
	],
	'help': 'Slower - Decrease the reading speed by 5 words per minute.  '
};

var Rate = {
	'str': 'rate',
	'param' : 'rate',
	'action': '',
	'commands': [
	],
	'help': 'Rate - Set the reading speed to a specific rate, measured in words per minute.  '
};


//Yelp Commands
var Sort = {
	'str': 'sort',
	'param': 'sort',
	'action': function (input) {
		console.log('sort input ' + input);
		if (input in Sort.dict) {
			input = Sort.dict[input];
			console.log(Sort.dict[input]);	
			return input;
		}
		else return '';
	},
	'commands': [
	],
	'dict': {
	'best match': 0,
	'highest rated': 1,
	'distance': 2
	},
	'help': 'Sort - Sort the search results from Yelp.com based on: Best match, Distance, and Rating.  '
};


var Category = {
	'str': 'category',
	'param': 'category_filter',
	'action': '',
	'commands': [
	],
	'help': 'Category - Specify which type of business you would like to search for. The default category is Restaurants.  '
};

var Location = {
	'str': 'location',
	'param': 'location',
	'action': function (input) {
		input = input.replace(/s /,''); //fix WSAPI's tendency to make location plural
		delete commandThread['ll'];
		return input;
	},
	'commands': [
	],
	'help': 'Location - Specify which area you would like to search within. Example values: Philadelphia, Mission San Francisco, East Village. '
};

var Search = {
	'str': 'search',
	'param': 'term',
	'action': function(input) {
		audio.setAttribute('src', '');
		return input;
	},
	'commands': [
	],
	'help': 'Search - Specify what you would like to search for. Example values: Dinner, Chinese, McDonald\'s. '
};


var Help = {
	'str': 'help',
	'param': null,
	'list': [],
	'commands': [],
	'action': function() {
		voiceQueue = [];
		for (var i = 0; i < Help.list.length;i++) {
			//setTimeout(voiceSynth(Help.list[i],null), 2000)
			voiceSynth(Help.list[i],null);
		}},
	'help': 'Help - List all currently available commands.  '
};

var Call = {
	'str': 'call',
	'param': null,
	'action': function() {
		voiceSynth('Calling ' + voiceCursor.name ,null)
		return input;
	},
	'commands': [
	],
	'help': 'Search - Specify what you would like to search for. Example values: Dinner, Chinese, McDonald\'s. '
};

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
		Help,
		Call
	]
};

var voiceQueue = [];
var speed = 0;
//Error and edgecase logic
if (!('webkitSpeechRecognition' in window)) {
	button.style.display = 'none';
	image_src.style.display = 'none';
	upgrade.style.display = 'block';
	upgrade_warning.innerHTML = 'This Demo requires Chrome version 25 or higher. Please switch browsers before continuing.';
}
else {
	//window.onload = voiceSynth(welcome.innerHTML, null);
	window.onload = navigator.geolocation.getCurrentPosition(setLocation, errorLocation);
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;	
}

//other variables
var commands = '';
var recognizing;
reset();
commandFind();
recognition.onend = reset;
var guessed_location = '';
function commandThreadDefault () {
	this.category_filter = 'restaurants';  //set search defaults
	this.location = guessed_location;
	this.limit = 5;
	this.radius_filter = 1000;
}
var commandThread = new commandThreadDefault();
var locationString = '';
var api_URL = '/yelp/';
var results = '';
var voiceBusy = false;
var voiceCursor = null;
var ajaxBusy;
var previousAudio;
var prevLength = 0;
var speechString = '';

//defines which sub attributes to read for the yelp result set.
function yelpMore(voiceCursor) {
	sentence1 = voiceCursor.name + ' is a '/*coffe and tea store'; */ + voiceCursor.categories[0][0] + ' business.';//+  commandThread.category_filter + '.  ';
	sentence2 = 'Located in the '+ voiceCursor.location.neighborhoods[0] + ' area with a rating of ' +	voiceCursor.rating + ' stars from ' + voiceCursor.review_count + ' reviewers.  ';
	sentence3 = voiceCursor.name + 'is described as quote ' + voiceCursor.snippet_text + '.  ';
	var phoneStr;
	/*for (var i = 0; i < voiceCursor.phone.length; i++) {
		phoneStr += voiceCursor.phone[i] + ' ';
	}
	sentence4 = 'For more information, call - ' + phoneStr.slice(1); */
	return [sentence1, sentence2, sentence3/*,sentence4*/];
}

//Initial set up
for (var i = 0; i < commandList.commands.length; i++) {
	commandList.commands[i]['commands'] = commandList.commands[i]['commands'].concat(commandList.commands);
	Help.list.push(commandList.commands[i].help);
}




//logic for setting user location
function setLocation(input) {
	var latitude = input.coords.latitude;
	var longitude = input.coords.longitude;
	var accuracy = input.coords.accuracy;
	var locationString = latitude +','+longitude;
	commandThread['ll'] = locationString+','+accuracy;
	commandThread['cll'] = locationString;
}

function errorLocation(input) {
	console.log('Error finding location');
	voiceSynth('We could not find your location. Please say your location when submitting your search. For example "search bars location san francisco."',null);
}

//UI logic: Starting and stopping recognition
recognition.onresult = function (event) {
	var interim = '';
	last = event.results.length -1;
	if (event.results[last].isFinal && !ajaxBusy) {
		speechString = event.results[last]['0'].transcript;
		console.log("string is " + speechString);
		commands = commandFind(speechString, commandList.commands); //only parse new text.
		commandParse(commands);
		console.log('WHATS GOING ON HERE?!?!? '+ JSON.stringify(commandThread));
		ajaxBusy = true;
		commandExecute(commandThread);
		prevLength = speechString.length;	//might not be necessary, meant to prevent API from firing too often.		
	}
	else {
		interim += event.results[last]['0'].transcript;
	} 
	final_span.innerHTML = speechString;
	interim_span.innerHTML = interim;
	
}; 

function reset() {
	recognizing = false;
	button.innerHTML = 'Click to Speak';
	image_src.src = 'images/mic.gif';
	commandThread = new commandThreadDefault();
}

function toggleStartStop() {
	if (recognizing) {
		recognition.stop();
		reset();
		playTone('cancel.wav');
	}
	else {
		recognition.start();
		recognizing = true;
		button.innerHTML = 'Click to Stop';
		image_src.src = 'images/mic-animate.gif';
		final_span.innerHTML = '';
		interim_span.innerHTML = '';
		playTone('begin.wav');
	}
}
////Command Parsing and execution logic

//Searches input string against list of cammandsand returns array of command + substring
function commandFind(string, list) {
	//console.log("did it clean up "+ input + ', '+ command_current+ ', ' + command_next+ ', ' + substring+ ', ' +result)	
	if (typeof(string) != "undefined"  && typeof(list) != "undefined") {
		for (var i = 0; i < list.length; i++) {
			commandIndex = string.search(list[i].str.toLowerCase());
			if (commandIndex != -1) {
				//audioPause()
				input = string.substr(0,commandIndex);
				command_next = list[i]; //This is an object
				substring = string.substr(commandIndex+list[i].str.length);
				result = [input, command_next, substring];
				console.log('result '+result);
				return result;
			}
		}
		return [string];
	}
	return [string];
}

//Separates compound commands from initial input
function commandParse(array) {
	if (array[1] == undefined) {console.log('no command' + array)}
	else {
		command_current = array[1];
		substring = array[2];
		parsed = commandFind(substring, command_current.commands);
		input = parsed[0].trim();
		//if input = "" command_current.prompt() 
		input = commandTranslate(command_next, input);
		commandThread[command_current.param] = input;
		commandParse(parsed);
	}
}

//executes individual commands
function commandExecute(query) {
	//Remove empty params in Query
	console.log('WHAT IS GETTING EXECUTED ' + JSON.stringify(query));
	for (var i = 0; i < Object.keys(query).length; i++) {
	 	if(commandThread[Object.keys(query)[i]] == "") {
			delete commandThread[Object.keys(query)[i]];
		}}
	if (Object.keys(query).length > 4 && query.term) {
		if (query.term) {term = query.term};	
		console.log("keys " + Object.keys(query)); 
		console.log("query" + JSON.stringify(query));
		playTone('morse.wav');
		$.ajax(api_URL + JSON.stringify(query), {
		type: 'GET',
		dataType: 'JSON',
		success: function(data) {
			delete commandThread.term;	
			console.log(data);
			results = data;
			voiceSynth('There are '+ results.total + ' results for ' + term + '.', null);
			console.log(results.total + ' ' + term)
			for (var i = 0; i < Object.keys(results.businesses).length; i++) {
				name = results.businesses[i].name + '	 - ';
				rating = results.businesses[i].rating + ' stars. ';
				//neighborhood = results.business[i].location.neighborhoods[0] + '.' :neighborhoods is undefined for some reason
				voiceSynth(name + rating, results.businesses[i]);
				ajaxBusy = false;
			}
		},
		error: function (xhr, ajaxOptions, thrownError) {
			playTone('error.wav');
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
			ajaxBusy = false;
			}
		});
	}
	else {
		console.log('no dice!!!!!!!!!!!!!!');
		ajaxBusy = false;
	}	
}

function voiceSynth (string, name) {
	if(voiceQueue.indexOf(string)== -1){
		voiceQueue.push(string);	
		voiceQueue.push(name);
	}	
	voiceCleanup();	
}

function voiceCall (string, name) {
	voiceBusy = true;
	console.log('synth called on ' + string);
	$.ajax('read/?text=' + string + '&speed=' + speed, {
		type: 'GET',
		success: function(src) {
			audio.setAttribute('src', src);	
			audio.play();		
			console.log(src)
			ajaxBusy = false;
			voiceCursor = name;
			voiceCleanup();	
		},
		error: function(xhr, ajaxOptions, thrownError) {
			playTone('error.wav');
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
			ajaxBusy = false;
			voiceCleanup();
			}
	});
}

/*  Old Voice call with speech.js
function voiceCall (string, name) {
	voiceBusy = true;
	console.log('synth called on ' + string);
	$.ajax('read/?string=' + string + '&speed=' + speed, {
		type: 'GET',
		success: function(src) {
			audio.setAttribute('src', src);	
			audio.play();		
			ajaxBusy = false;
			voiceCursor = name;
			voiceCleanup();	
		},
		error: function(xhr, ajaxOptions, thrownError) {
			playTone('error.wav');
			console.log(xhr);
			console.log(ajaxOptions);
			console.log(thrownError);
			ajaxBusy = false;
			voiceCleanup();
			}
	});
}

*/

function handleAudioEnded() {
	console.log('audio has ended');
	previousAudio = audio.getAttribute('src');
	results_span.innerHTML = '';
	voiceBusy = false;
	voiceCleanup();
}

audio.addEventListener('ended', handleAudioEnded);

//check for unread items
function voiceCleanup() {
	if (voiceQueue.length > 1 && !voiceBusy) {
		string = voiceQueue.shift();
		cursor = voiceQueue.shift();
		voiceCall(string,cursor);
		ajaxBusy = true;
		results_span.innerHTML += string;

	}
}

function audioPause() {
	audio.pause();
	voiceBusy = false;
}

function playTone(tone) {
	if (voiceQueue.length===0 && previousAudio != tone) {
		console.log('tone played');
		audio.setAttribute('src', tone);
		audio.play();
	}
}

//input translation should happen as part of the command definition
//ex. Sort.translate('distance') returns 2
function commandTranslate(command, input) {
	console.log('translate ' + command.str + input);
	if (command.str == 'category') {
		input = input.replace(/\s+/g, '').toLowerCase();
		console.log('cleaned input' + input);
		return input;
	}
	if (command.str == 'sort') {
		return Sort.action(input);
	}
	if (command.str == 'stop') {
		console.log('stop');
		Stop.action(input);
	}
	if (command.str == 'start') {
		console.log('start');
		Start.action(input);
	}
	if (command.str == 'faster') {
		console.log('faster');
		Faster.action(input);
	}
	if (command.str == 'slower') {
		console.log('slower');
		Slower.action(input);
	}
	if (command.str == 'rate') {
		console.log('rate');
		Rate.action(input);
	}
	if (command.str == 'help') {
		console.log('help');
		Help.action(input);
	}
	if (command.str == 'location') {
		console.log('location action called');
		return Location.action(input);
	}
	if (command.str == 'more') {
		console.log('more action called');
		return More.action(input);
	}
	if (command.str == 'search') {
		console.log('search action called');
		return Search.action(input);
	}
	if (command.str == 'call') {
		console.log('call action called');
		return Call.action(input);
	}							
	else {
		return input;
	}

}

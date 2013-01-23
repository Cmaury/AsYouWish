//Help Commands
var Search = new Object();
Search.str = "Search"
Search.commands = []

var List = new Object();
List.str = "List"
List.commands = [Search]

// Global Commands
var Faster = new Object();
Faster.str = "Faster"


var Help = new Object();
Help.str = "Help"
Help.commands = [
	List,
	Search
]

var commandList = [
	Help,
	Faster
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
commandThread = [];


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
	console.log(commandThread);
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

	}
}

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
				console.log("searched input is " + input)
				return result
			}
			else {
				console.log("event is " + event)
				return [event] //if no command found treats string as input for previous command (if any)
			}
		}
	}
	console.log("input is undefined")
	return [event] 
};

//Separates compound commands from initial input
function commandParse(array) {
	if (array[1] == undefined) {
		return array //no command found
		console.log("parse undefined")
	}	
	else {
		console.log('parse input ' + array)
		command_current = array[1]
		substring = array[2]
		parsed = commandFind(substring, command_current.commands) 
		console.log(parsed)
		input = parsed[0]	
		commandThread.push(command_current, input)
		commandParse(parsed)
	}
}

/*executes individual commands
function commandExecute(array) {
	for (var i = 0; i < commandThread.length; i++) {
		command = commandThread[i][0]
		input = commandThread[i][1]
		console.log("Executed "+ command " with the value " + input)
	};

}
*/

//Error and edgecase logic

if (!('webkitSpeechRecognition' in window)) {
	alert('This Demo requires Chrome version 25 or higher. Please switch browsers before continuing.')
}
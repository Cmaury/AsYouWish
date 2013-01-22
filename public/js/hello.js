//Help Commands
var List = new Object();
List.str = "List"
List.commands = ""

var Search = new Object();
Search.str = "Search"
Search.commands = ""

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
	if (typeof(event) != "undefined") {
		for (var i = 0; i < commandList.length; i++) {
			commandIndex = event.search(commandList[i].str.toLowerCase())
			if (commandIndex != -1) {
				input = event.substr(0,commandIndex)
				command = commandList[i]; //This is an object
				substring = event.substr(commandIndex+commandList[i].str.length)
				result = [input, command, substring]
				return result
			}
			else {
				return [event]
			}
		}
	}
	return [] //if no command found treats string as input for previous command (if any)
};

//Separates compound commands from initial input
function commandParse(array) {
	if (array[1] == undefined) return //no command found
	else {
		console.log("command list is" + command.commands)
		command = array[1]
		substring = array[2]
		input = commandFind(substring, command.commands)[0]	
		commandThread.push(command, input)
		console.log(commandThread)
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
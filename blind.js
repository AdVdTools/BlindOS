(function (global, undefined) {

	var BlindOS = BlindOS || function(options) {

		var defaults = {
            textInputID: 'blind-text-input',
            voiceInputID: 'blind-voice-input',
            viewID: 'blind-view',
            audioOutputID: 'blind-audio-output'
		};

        var options = options || {};
        for (var attrname in defaults) { 
            if (!(attrname in options)) {
                options[attrname] = defaults[attrname];
            }
            /*if (typeof(options[attrname]) == "undefined") {
                options[attrname] = defaults[attrname];
            }*/
        }
        console.log(options)

        var _current;
        var _safeEnvironment = {};
        var _environment = localStorage.environment ? JSON.parse(localStorage.environment) : {};

        var _textInput;
        var _view;

        console.log(arguments)// all the function arguments, including arguments beyond those specified in the signature

		var extensions = Array.prototype.slice.call(arguments, 1);
        var defaultCommands = {
            execute: function(cmd, args) {
                switch (cmd) {
                    case 'clear':
                        _view.clear();
                        break;

                    case 'help':
                        output ('TODO');
                        break;

                    case 'echo':
                        output(args.join(' '))
                        break;

                    case 'env':
                    case 'environment':
                        if (args.length == 0) for(var envvar in _environment) output(envvar+'='+_environment[envvar]);
                        else if (args.length == 1) {
                            if (args[0] === 'clear') localStorage['environment'] = JSON.stringify(_environment = {})
                            else output(_environment[args[0]]);
                        }
                        else setEnvironment(args);
                        break;

                    case 'ver':
                    case 'version':
                        output('Version: '+blind.version);
                        break;

                    default:
                        // Unknown command.
                        return false;
                };
                return true;
            }
        }

        function doCommand(inputLine) {
            // Parse out command, args, and trim off whitespace.
            if (inputLine && inputLine.trim()) {
				var args = inputLine.split(' ').filter(function(val, i) {
					return val;
				});
				var cmd = args[0];
				args = args.splice(1); // Remove cmd from arg list.
			}

			if (cmd) {
				var response = defaultCommands.execute(cmd, args);
				if (response === false) {
                    for (var index in extensions) {
                        var ext = extensions[index];
                        if (ext.execute) response = ext.execute(cmd, args);
                        if (response !== false) break;
                    }
				}
				if (response === false) output(cmd + ': command not found');
			}
        }
        function autoCompleteCommand(command, index) {
            var left = command.slice(0, index);
            var right = command.slice(index);

            return left+right;
        }
        function getAutoCompleteOptions(command, index) {
            var left = command.slice(0, index);
            var right = command.slice(index);

            return [];
        }

        var envParser;

        function setEnvironment(args) {
            envParser = envParser || new SentenceParser([
                // Detect patterns:
                { regex: /([^\s,]+)=(.+)/i, map: { name: 1, value: 2 }, captureCount: 2 },
                { regex: /set ([^\s,]+) to ([^\s,]+)/i, map: { name: 1, value: 2 }, captureCount: 2 },// set * to *
                { regex: /([^\s,]+) (is|equals) ([^\s,]+)/i, map: { name: 1, value: 3 }, captureCount: 3 },// * is *
                // * equals *
                { regex: /assign ([^\s,]+) to ([^\s,]+)/i, map: { name: 2, value: 1 }, captureCount: 2 },// assing * to *
                // make * be *
                { regex: /let ([^\s,]+) be ([^\s,]+)/, map: { name: 1, value: 2 } },// let * be *
                { words: ['lets', 'say', undefined, 'is', undefined], map: { name: 1, value: 2 } }// lets say * is *
                // lets say * equals *
                // All these words should become keywords
            ], {
                findMultiple: true,
                groupDelimiters: [', ', ' & ', ' and ']
            })
            var result = envParser.parse(args.join(' '), function (sentence, maps) {
                if (maps) {
                    _environment[maps.name] = maps.value;
                    output(maps.name+'='+maps.value + ' ('+sentence+')');
                }
                else {
                    output('Couldn\'n parse any more ('+sentence+')')
                }
            });
            console.log(result + ' matches')
            if (result > 0) localStorage['environment'] = JSON.stringify(_environment);
            else output('Couldn\'t set any env');
        }
        
        function output(text) {
            if (_view) _view.output(text);
            else console.log("No display: "+text);
        }

        function connect(type, component) {
            switch (type) {
            case 'text-input':
                _textInput = component;
                if ("onCommand" in _textInput)  _textInput.onCommand = doCommand;
                if ("onAutoComplete" in _textInput)  _textInput.onAutoComplete = autoCompleteCommand;
                if ("getAutoCompleteOptions" in _textInput)  _textInput.getAutoCompleteOptions = getAutoCompleteOptions; 
                break;
            
            case 'view':
                _view = component;
                break;
            }
        }
 
		var blind = {
            output: output,
            connect: connect,
			version: '1.0.0'
        }
        return blind;
	};

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = BlindOS;
    } 
	// web browsers
	else {
		var oldBlindOS = global.BlindOS;
		BlindOS.noConflict = function () {
			global.BlindOS = oldBlindOS;
			return BlindOS;
		};
		global.BlindOS = BlindOS;
	}

})(this);
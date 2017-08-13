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

        document.head.appendChild(loadJS("sentenceParser.js"));//TODO prevent input until all scripts are loaded or handle unloaded functions properly

        console.log(arguments)// all the function arguments, including arguments beyond those specified in the signature

        var extensions = Array.prototype.slice.call(arguments, 1);
        var cmdParser;
        var defaultCommands = {
            execute: function(inputLine) {
                cmdParser = cmdParser || new SentenceParser([
                    // Detect patterns:
                    new SentencePattern(/clear/i, { }, function(s, m) {
                        _view.clear();
                    }),
                    {
                        regex: /help/i, map: { },
                        callback: function(s, m) {
                            output('I need help too');
                        }
                    },
                    {
                        regex: /echo (.+)/i, map: { text: 1 },
                        callback: function(s, m) {
                            output(m.text);
                        }
                    },
                    {
                        regex: /(env|environment)/i, map: { },
                        callback: function(s, m) {
                            for(var envvar in _environment) output(envvar+'='+_environment[envvar]);
                        }
                    },
                    {
                        regex: /(env|environment) (.+)/i, map: { args: 2 },
                        callback: function(s, m) {
                            setEnvironment(m.args)
                        }
                    },
                    {
                        regex: /clear (env|environment)/i, map: { },
                        callback: function(s, m) {
                            localStorage['environment'] = JSON.stringify(_environment = {})
                        }
                    },
                    {
                        regex: /ver|version/i, map: { },
                        callback: function(s, m) {
                            output('Version: '+blind.version)
                        }
                    }
                    // All these words should become keywords
                ], {
                    // Options
                })
                var result = cmdParser.parse(inputLine);
                return result;
            }
        }

        function doCommand(inputLine) {
            // Parse out command, args, and trim off whitespace.
            if (inputLine && inputLine.trim()) {
                var response = defaultCommands.execute(inputLine);
				if (response === false) {
                    for (var index in extensions) {
                        var ext = extensions[index];
                        if (ext.execute) response = ext.execute(inputLine);
                        if (response !== false) break;
                    }
				}
				if (response === false) output('Couldn\'t understand: '+inputLine);
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

        function setEnvironment(inputLine) {
            function handleParse(sentence, maps) {
                if (maps && maps.name) {
                    _environment[maps.name] = maps.value;
                    output(maps.name+'='+maps.value + ' ('+sentence+')');
                }
            }
            envParser = envParser || new SentenceParser([
                // Detect patterns:
                { 
                    regex: /(.+) (and|&) (.+)/i,
                    map: { left: 1, right: 3 },
                    callback: function(s, m) {
                        console.log(m.left+"..."+m.right)
                        envParser.parse(m.left, handleParse);
                        envParser.parse(m.right, handleParse);
                    }
                },
                { regex: /([^\s,]+)=(.+)/i, map: { name: 1, value: 2 } },
                { regex: /set ([^\s,]+) to ([^\s,]+)/i, map: { name: 1, value: 2 } },// set * to *
                { regex: /([^\s,]+) (is|equals) ([^\s,]+)/i, map: { name: 1, value: 3 } },// * is *
                { regex: /assign ([^\s,]+) to ([^\s,]+)/i, map: { name: 2, value: 1 } },// assing * to *
                { regex: /let ([^\s,]+) be ([^\s,]+)/, map: { name: 1, value: 2 } },// let * be *
                // All these words should become keywords
            ], {
                // Options
            })
            var result = envParser.parse(inputLine, handleParse);
            console.log(result + ' matches')
            if (result) localStorage['environment'] = JSON.stringify(_environment);
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

            case 'extension':
                extensions.push(component);
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
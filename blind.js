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

        var _current = {};

        var _textInput;
        var _view;
        var _voiceSynth;

        document.head.appendChild(loadJS("sentenceParser.js"));//TODO prevent input until all scripts are loaded or handle unloaded functions properly

        console.log(arguments)// all the function arguments, including arguments beyond those specified in the signature

        var extensions = Array.prototype.slice.call(arguments, 1);
        _current.extensions = extensions
        var cmdParser;
        var defaultCommands = {
            execute: function(inputLine) {
                cmdParser = cmdParser || new SentenceParser([
                    // Detect patterns:
                    new SentencePattern(/clear/i, { }, function(m) {
                        _view.clear();
                    }),
                    new SentencePattern(/help/i, { }, function(m) {
                        output('I need help too');
                    }),
                    new SentencePattern(/echo (.+)/i, { text: 1 }, function(m) {
                        output(m.text);
                    }),
                    new SentencePattern(/close/i, {}, function(m) {
                        output('Closed')
                        _current.submodule = null
                    }),
                    {
                        regex: /ver|version/i, map: { },
                        callback: function(m) {
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

        function executeCommand(inputLine) {
            // Parse out command, args, and trim off whitespace.
            if (inputLine && inputLine.trim()) {
            	try {
	                var response = defaultCommands.execute(inputLine);
	                if (response === false && _current.submodule) {
	                    response = _current.submodule.execute(inputLine);
	                }
					if (response === false) {
	                    for (var index in extensions) {
	                        var ext = extensions[index];
	                        if (ext.execute) response = ext.execute(inputLine);
	                        if (response !== false) break;
	                    }
					}
					if (response === false) output('Couldn\'t understand: '+inputLine);
				}
				catch (error) {
					output('Error: '+error);
				}
			}
        }
        
        function output(text) {
            if (typeof text === 'string') {
                if (_view) outputText(text);
                if (_voiceSynth) outputVoice(text);
                if (!_view && !_voiceSynth) console.warn('No output: '+text)
            }
            else if (text) {
                if (text.toVoiceString) outputVoice(text.toVoiceString());
                else if (text.toString) outputVoice(text.toString());
                if (text.toString) outputText(text.toString());
            }
        }

        function outputText(text) {
            if (_view) {
                _view.output(text);
            }
            else console.warn("No display: "+text);
        }

        function outputVoice(voiceText) {
            if (_voiceSynth) {
                _voiceSynth.output(voiceText);
            }
            else console.warn("No voice synth: "+voiceText);
        }

        function connect(type, component) {
            switch (type) {
            case 'view':
                _view = component;
                break;
            
            case 'voice-synth':
                _voiceSynth = component;
                break;

            case 'extension':
                extensions.push(component);
                break;
            }
        }
 
		var blind = {
            current: _current,
            executeCommand: executeCommand,
            output: output,
            outputText: outputText,
            outputVoice: outputVoice,
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
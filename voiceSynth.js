(function (global, undefined) {
    if (!speechSynthesis) return;
    var parser;

	var VoiceSynth = VoiceSynth || function(blindOS, options) {
        if (!blindOS) { 
            console.error('blindOS reference required.');
            return;
        }

		var defaults = {
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

        var utt = new SpeechSynthesisUtterance();
        
		function output(text) {
            utt.text = text;
            speechSynthesis.speak(utt);
        }//TODO queues
        
        function setVoice(voiceName) {
            var voices = speechSynthesis.getVoices();
            var voice = voices.find((v) => v.name === voiceName);
            console.log(voice)
            if (voice) utt.voice = voice;
            else blindOS.output(voiceName+" not found");
        }

		var shelf = {
            execute: function (inputLine) {
                parser = parser || new SentenceParser([
                    // Detect patterns:
                    new SentencePattern(/voice/i, { }, function(m) {
                        blindOS.current.submodule = {
                            execute: function(inputLine) {
                                shelf.output(inputLine)
                                return true;
                            }
                        }
                    }),
                    new SentencePattern(/list voices/i, { }, function(m) {
                        shelf.listVoices()// set current list with onSelect method to perform select voice ***
                    }),
                    new SentencePattern(/voice list/i, { }, function(m) {
                        shelf.listVoices()// set current list with onSelect method to perform select voice ***
                    }),
                    new SentencePattern(/set voice (.+)/i, { voice: 1 }, function(m) {
                        setVoice(m.voice);
                    }),
                    new SentencePattern(/voice (.+)/i, { args: 1 }, function(m) {
                        //execute submodule
                        shelf.output(m.args)
                    }),
                    new SentencePattern(/voice shutup/i, { }, function(m) {
                        speechSynthesis.cancel();
                    })
                ], {
                    // Options
                })
                var result = parser.parse(inputLine);
                return result;
            },
            listVoices: function() {
                var voices = speechSynthesis.getVoices();
                for(var i = 0; i < voices.length; i++) {
                    blindOS.outputText(i+" - "+voices[i].name)
                    console.log(voices[i])
                }
                console.log(voices)
            },
			output: output
        }
        return shelf;
	};

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = VoiceSynth;

	// web browsers
	} else {
		var oldVoiceSynth = global.VoiceSynth;
		VoiceSynth.noConflict = function () {
			global.VoiceSynth = oldVoiceSynth;
			return VoiceSynth;
		};
		global.VoiceSynth = VoiceSynth;
	}

})(this);
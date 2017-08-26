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

        var currVoice;
        
		function output(text) {
            var utt = new SpeechSynthesisUtterance();
            utt.text = text;
            if (currVoice) utt.voice = currVoice;
            speechSynthesis.speak(utt);
        }//TODO queues
        
        function setVoice(voice) {
            if (typeof voice === "string") voice = speechSynthesis.getVoices().find((v) => v.name === voice);
            console.log(voice)
            if (voice) currVoice = voice;
            else blindOS.output(voice+" not found", "warning");
        }

        function getVoiceSelector(index, voice) {
            var voiceSelector = document.createElement("pre");
            voiceSelector.innerText = index+" - "+voice.name;
            voiceSelector.onclick = function() {
                setVoice(voice);
            }
            voiceSelector.toVoiceString = function () { return voice.name; }
            return voiceSelector;
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
                    new SentencePattern(/(voice )?shut\s?up/i, { }, function(m) {
                        speechSynthesis.cancel();
                    }),
                    new SentencePattern(/voice (.+)/i, { args: 1 }, function(m) {
                        //execute submodule
                        shelf.output(m.args)
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
                    //blindOS.outputText(i+" - "+voices[i].name)
                    var voiceSelector = getVoiceSelector(i, voices[i])
                    blindOS.output(voiceSelector, "special");
                    console.log(voiceSelector)
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
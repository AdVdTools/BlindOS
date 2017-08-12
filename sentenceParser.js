(function (global, undefined) {

	var SentenceParser = SentenceParser || function(patterns, options) {
		if (!patterns) return;

		var defaults = {
            findMultiple: false
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

		function parse(sentence, callback) {
            for (var index = 0; index < patterns.length; index++) {
                var pattern = patterns[index];
                if (pattern.regex) {
                    var result = pattern.regex.exec(sentence);
                    if (result && result.index === 0) {
                        console.log(result);
                        var maps = {}
                        for(var attr in pattern.map) {
                            maps[attr] = result[pattern.map[attr]];
                            if (typeof maps[attr] === 'undefined') {
                                maps = null; break;
                            }
                        }
                        if (maps) {
                            var matchLength = result[0].length;
                            if (matchLength == sentence.length) {
                                callback(sentence, maps);
                                return 1;
                            } 
                            else if (options.findMultiple) {
                                for(var delimIndex = 0; delimIndex < options.groupDelimiters.length; delimIndex++) {
                                    var delim = options.groupDelimiters[delimIndex];
                                    if (sentence.startsWith(delim, matchLength)) {
                                        callback(sentence.slice(0, matchLength), maps);
                                        var count = parse(sentence.slice(matchLength+delim.length), callback);
                                        console.log("HERE "+count)
                                        return count + 1;//extra match
                                    }
                                }
                            }
                        }
                    }
                }
            }
            callback(sentence, null)
            return 0;//No match
		}

		return {
			parse: parse
		}
	};

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = SentenceParser;

	// web browsers
	} else {
		var oldSentenceParser = global.SentenceParser;
		SentenceParser.noConflict = function () {
			global.SentenceParser = oldSentenceParser;
			return SentenceParser;
		};
		global.SentenceParser = SentenceParser;
	}

})(this);
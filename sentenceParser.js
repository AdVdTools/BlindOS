(function (global, undefined) {

	var SentenceParser = SentenceParser || function(patterns, options) {
		if (!patterns) return;

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

        var _patterns = patterns.slice(0);

		function parse(sentence, callback) {
            for (var index = 0; index < _patterns.length; index++) {
                var pattern = _patterns[index];
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
                                if (callback && callback(maps, sentence, result) === false) continue;//Which one should come first TODO
                                if (pattern.callback && pattern.callback(maps, sentence, result) === false) continue;
                                return true;
                            } 
                        }
                    }
                }
            }
            if (callback) callback(null, sentence, null)
            return false;//No match
		}

		return {
            parse: parse,
            addPattern: function(pattern) { _patterns.push(pattern); }
		}
    };
    
    function SentencePattern(regex, map, callback) {
        this.regex = regex;
        this.map = map;
        this.callback = callback;
    }

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
        module.exports = SentenceParser;
        module.exports = SentencePattern;

	// web browsers
	} else {
		var oldSentenceParser = global.SentenceParser;
		SentenceParser.noConflict = function () {
			global.SentenceParser = oldSentenceParser;
			return SentenceParser;
		};
        global.SentenceParser = SentenceParser;
        
		var oldSentencePattern = global.SentencePattern;
		SentencePattern.noConflict = function () {
			global.SentencePattern = oldSentencePattern;
			return SentencePattern;
		};
        global.SentencePattern = SentencePattern;
	}

})(this);
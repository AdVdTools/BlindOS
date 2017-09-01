(function (global, undefined) {
    var parser;
	var FindKey = FindKey || function(blindOS, options) {
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

        var keys = [
            "RequestAnimationFrame",
            "CancelAnimationFrame",
            "requestIdleCallback",
            "cancelIdleCallback_",
            "_captureEvents",
            "_releaseEvents",
            "getComputedStyle",
            "match Media",
            "moveTo",
            "moveBy",
            "resize_to",
            "resize_by",
            "get_selection",
            "find",
            "getMatchedCSSRules",
            "webkitRequestAnimationFrame",
            "webkitCancelAnimationFrame",
            "btoa",
            "ATOB",
            "set123Timeout",
            "clearTimeout",
            "setInterval654",
            "pos0t_423Message",
            "clearInterval",
            "BlindOS"
        ]

        var space = ' '.charCodeAt(0);//TODO change to literals
        var underscore = '_'.charCodeAt(0);
        var a = 'a'.charCodeAt(0);
        var z = 'z'.charCodeAt(0);
        var A = 'A'.charCodeAt(0);
        var Z = 'Z'.charCodeAt(0);
        var zero = '0'.charCodeAt(0);
        var nine = '9'.charCodeAt(0);
        

        // var brokenKeys = keys.map((k) => {
        //     return breakKey(k);
        // });

        function breakKey(key) {
            var bk = { key: key }
            bki = new Array(10);
            bkw = "";
            var bkiSize = 0;
            var lastIndex = 0;
            var withinWord = false;
            var withinNumber = false;
            var debug = "";
            for (var i = 0; i < key.length; i++) {
                var char = key.charCodeAt(i);
                if (/*char === space || */char === underscore) {
                    if (withinWord || withinNumber) {
                        bkw += key.slice(lastIndex, i);
                        withinWord = false;
                        withinNumber = false;
                        continue;
                    }
                }
                else if (char >= a && char <= z) {
                    if (withinNumber) {
                        bkw += key.slice(lastIndex, i);
                        withinNumber = false;
                    }
                    if (!withinWord) {//New word
                        lastIndex = i;
                        bki[bkiSize++] = bkw.length;
                    }
                    withinWord = true;
                }
                else if (char >= A && char <= Z) {
                    if (withinWord || withinNumber) {
                        bkw += key.slice(lastIndex, i);
                        withinNumber = false;
                    }
                    lastIndex = i;
                    bki[bkiSize++] = bkw.length;
                    withinWord = true;
                }
                else if (char >= zero && char <= nine) {
                    if (withinWord) {
                        bkw += key.slice(lastIndex, i);
                        withinWord = false;
                    }
                    if (!withinNumber) {//New word
                        lastIndex = i;
                        bki[bkiSize++] = bkw.length;
                    }
                    withinNumber = true;
                }
                else {
                    return null;
                }
                //debug += lastIndex+(withinWord ? "a" : "_");
            }
            if (withinWord || withinNumber) {
                bkw += key.slice(lastIndex, i);
            }
            //blindOS.outputText(debug);//TODO remove

            bk.indices = bki;
            bk.content = bkw.toLowerCase();
            blindOS.outputText(JSON.stringify(bk));
            return bk;
        }

        function find(key) {
            //Abandoned
            blindOS.outputText("Not Implemented")
        }

		return {
            execute: function (inputLine) {
				parser = parser || new SentenceParser([
					// Detect patterns:
					new SentencePattern(/break (.+)/i, { key: 1 }, function(m) {
                        var bk = breakKey(m.key);
                        if (bk) brokenKeys.push(bk);
					}),
					new SentencePattern(/find (.+)/i, { key: 1 }, function(m) {
						find(m.key);
					}),
					new SentencePattern(/list keys/i, { }, function(m) {
						for(var i = 0; i < brokenKeys.length; i++) {
                            blindOS.outputText(JSON.stringify(brokenKeys[i]));
                        }
					})
				], {
					// Options
				})
				var result = parser.parse(inputLine);
				return result;
			},
            autoComplete: function (inputLeft) {
                var left = inputLeft.toLowerCase();
                var options = [ "break", "find", "list keys" ];
                var leftLength = left.length;
                if (leftLength === 0) return options;
                else return options.filter((o) => o.startsWith(left)).map((o) => o.substr(leftLength));
            }
		}
    };
    

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
        module.exports = FindKey;

	// web browsers
	} else {
		var oldFindKey = global.FindKey;
		FindKey.noConflict = function () {
			global.FindKey = oldFindKey;
			return FindKey;
		};
        global.FindKey = FindKey;
	}

})(this);
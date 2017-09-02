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
            "request__Idle_Callback",
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
            "MY_TEST".toLowerCase(),// Full upper case words not supported :(
            "MY_SECOND_TEST".toLowerCase(),
            "MY_THIRD_TEST".toLowerCase(),
            "MY_TEST_FOURTH".toLowerCase(),
            "set123Timeout",
            "clearTimeout",
            "setInterval654",
            "pos0t_423Message",
            "clearInterval",
            "BlindOS"
        ]
        var brokenKeys = []

        var space = ' '.charCodeAt(0);//TODO change to literals
        var lineBreak = '\n'.charCodeAt(0);
        var underscore = '_'.charCodeAt(0);
        var a = 'a'.charCodeAt(0);
        var z = 'z'.charCodeAt(0);
        var A = 'A'.charCodeAt(0);
        var Z = 'Z'.charCodeAt(0);
        var zero = '0'.charCodeAt(0);
        var nine = '9'.charCodeAt(0);
        


        function breakKey(key) {
            var bk = { key: key }
            bke = new Array(10);
            bkw = "";
            var bkeSize = 0;
            var lastWordStart = 0;
            var withinWord = false;
            var withinNumber = false;
            var debug = "";
            for (var i = 0; i < key.length; i++) {
                var char = key.charCodeAt(i);
                if (/*char === space || */char === underscore) {
                    if (withinWord || withinNumber) {
                        bkw += key.slice(lastWordStart, i);
                        bke[bkeSize++] = bkw.length;
                        withinWord = false;
                        withinNumber = false;
                        continue;
                    }
                }
                else if (char >= a && char <= z) {
                    if (withinNumber) {
                        bkw += key.slice(lastWordStart, i);
                        bke[bkeSize++] = bkw.length;
                        withinNumber = false;
                    }
                    if (!withinWord) {//New word
                        lastWordStart = i;
                    }
                    withinWord = true;
                }
                else if (char >= A && char <= Z) {
                    if (withinWord || withinNumber) {
                        bkw += key.slice(lastWordStart, i);
                        bke[bkeSize++] = bkw.length;
                        withinNumber = false;
                    }
                    lastWordStart = i;//New word
                    withinWord = true;
                }
                else if (char >= zero && char <= nine) {
                    if (withinWord) {
                        bkw += key.slice(lastWordStart, i);
                        bke[bkeSize++] = bkw.length;
                        withinWord = false;
                    }
                    if (!withinNumber) {//New word
                        lastWordStart = i;
                    }
                    withinNumber = true;
                }
                else {
                    return null;
                }
                //debug += lastWordStart+(withinWord ? "a" : "_");
            }
            if (withinWord || withinNumber) {
                bkw += key.slice(lastWordStart, i);
                bke[bkeSize++] = bkw.length;
            }
            //blindOS.outputText(debug);//TODO remove

            bk.ends = bke;
            bk.content = bkw.toLowerCase();
            blindOS.outputText(JSON.stringify(bk));
            return bk;
        }

        var minMatchThreshold = 0.35;
        var excessMatchThreshold = 1.25;

        function find(words) {
            words = words.toLowerCase();
            var bestMatch = 0;
            var bestKeys = [];
            for (var k = 0; k < brokenKeys.length; k++) {
                var key = brokenKeys[k];
                if (!key || !key.content || !key.ends || !key.ends[0]) continue;
                var content = key.content;
                var ends = key.ends;
                var contentIndex = 0;
                var bkei = 0;//brokenKeyEndIndex
                var bki = 0;
                var bke = ends[bkei];

                var matchCount = 0;
                var withinWord = false;
                var wordStart;
                for (var i = 0; i <= words.length; i++) {
                    var char = i < words.length ? words.charCodeAt(i) : lineBreak;//Process end of string in the loop
                    if (char == space || char == lineBreak) {
                        if (withinWord) {
                            while (bkei < ends.length && ends[bkei]) {
                                var cmc = charMatchCount(content, words, bki, wordStart, bke, i);
                                //blindOS.outputText(i+" words "+content.slice(bki,bke)+" "+words.slice(wordStart, i)+": "+cmc);
                                var bkLength = bke - bki;

                                bkei++;
                                bki = bke;
                                bke = ends[bkei];
                                if (cmc < bkLength) {//Incomplete
                                    if (cmc > bkLength * minMatchThreshold) {
                                        matchCount += cmc;
                                        break;
                                    }
                                    else {
                                        matchCount -= bkLength;
                                        continue;//Missed a word
                                    }
                                }
                                else {
                                    var wLength = i - wordStart;
                                    if (wLength < bkLength * excessMatchThreshold) {
                                        matchCount += bkLength * 2 - wLength;
                                        break;
                                    }
                                    else {
                                        matchCount -= bkLength;
                                        continue;//Missed a word
                                    } 
                                }
                            }
                            
                        }
                        withinWord = false;
                    }
                    else {
                        if (!withinWord) {
                            wordStart = i;
                            withinWord = true;
                        }
                    }
                }
                if (bki < content.length) matchCount -= (content.length - bki);//Missing words
                blindOS.outputText(key.key + ": " + matchCount);
                if (matchCount == content.length) {
                    bestKeys = [ key ];
                    bestMatch = matchCount;
                    break;
                }
                if (matchCount * 0.8 > bestMatch) {
                    bestKeys = [ key ];
                    bestMatch = matchCount;
                }
                else if (matchCount > bestMatch * 0.8) {
                    bestKeys.push(key);
                }
            }
            for (var bk = 0; bk < bestKeys.length; bk++) {
                blindOS.outputText(bestKeys[bk].content);
            }
            blindOS.outputText("Needs weight adjusting")
        }

        //% of A that B matches
        function charMatchCount(stringA, stringB, startA, startB, endA, endB) {
            var i, j;
            for (i = startA, j = startB; i < endA && j < endB; i++, j++) {
                if (stringA.charCodeAt(i) !== stringB.charCodeAt(j)) break;
            }
            return (i - startA);
        }

		return {
            execute: function (inputLine) {
				parser = parser || new SentenceParser([
					// Detect patterns:
                    new SentencePattern(/break test/i, { }, function () {
                        brokenKeys = keys.map((k) => {
                            return breakKey(k);
                        });
                    }),
					new SentencePattern(/break (.+)/i, { key: 1 }, function(m) {
                        var bk = breakKey(m.key);
                        if (bk) brokenKeys.push(bk);
                    }),
					new SentencePattern(/find (.+)/i, { words: 1 }, function(m) {
						find(m.words);
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
                var options = [ "break", "break test", "find", "list keys" ];
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
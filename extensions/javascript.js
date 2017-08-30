(function (global, undefined) {
    var parser;

	var BlindJS = BlindJS || function(blindOS, options) {
        if (!blindOS) { 
            console.error('blindOS reference required.');
            return;
        }
        console.log(typeof this);
        console.log(typeof blindOS);

		var defaults = {
            storage: 'todos'
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

		//global functions
		global.output = function(text) {
			blindOS.output(text);
		}
		
		
        function evalJS(inputLine) {
	        if (inputLine !== '') {
	        	try {
	        		var result = window.eval(inputLine);
	        		if (result !== undefined) {
	        			blindOS.output(new String(result));
	        		}
	        	} catch(e) {
	        		blindOS.output(new String(e), "error");
	        	}
	        } 
	        else {
	        	this.echo('');
	        }
        }

		var shelf = {
            execute: function(inputLine) {
                parser = parser || new SentenceParser([
                    // Detect patterns:
                    new SentencePattern(/(js|javascript)/i, { }, function(m) {
                        blindOS.output ('JS Console');//TODO launch sub env
                        blindOS.current.submodule = {
                        	execute: function(inputLine) {
                        		evalJS(inputLine);
                        		return true;
                        	}
                        }
                    }),
                    new SentencePattern(/(js|javascript) (.+)/i, { args: 2 }, function(m) {
                        //eval js
                        evalJS(m.args);
                    })
                ], {
                    // Options
                })
                var result = parser.parse(inputLine);
                return result;
            },
            autoComplete: function (inputLeft) {
                var left = inputLeft.toLowerCase();
                var options = ["js", "javascript"]
                var leftLength = left.length;
                if (leftLength === 0) return options;
                else return options.filter((o) => o.startsWith(left)).map((o) => o.substr(leftLength));
            }
        }
        return shelf;
    };

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
        module.exports = BlindJS;

	// web browsers
	} else {
		var oldBlindJS = global.BlindJS;
		BlindJS.noConflict = function () {
			global.BlindJS = oldBlindJS;
			return BlindJS;
		};
        global.BlindJS = BlindJS;   
	}
	
})(this);
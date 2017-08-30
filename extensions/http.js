(function (global, undefined) {
    var parser;
	var BlindHttp = BlindHttp || function(blindOS, options) {
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

        function http (method, url, body) {
            var httpReq = new XMLHttpRequest();
            if (!url.startsWith("http://") && !url.startsWith("https://")) url = "http://"+url;
            httpReq.open(method.toUpperCase(), url);
            httpReq.addEventListener("progress", function (e) {
                //for(var attr in e) blindOS.output(attr+" "+e[attr])
                //Update a line with e.loaded/e.total if e.total != 0
            });
            httpReq.addEventListener("load", function (e) {
                blindOS.output(httpReq.responseText);
                //for(var attr in httpReq) blindOS.output(attr+" "+httpReq[attr])
            });
            httpReq.addEventListener("error", function (e) {
                blindOS.output("error: "+JSON.stringify(e));
            });
            httpReq.addEventListener("abort", function (e) {
                blindOS.output("abort: "+JSON.stringify(e));
            });
            httpReq.send(body);
        }

		return {
            execute: function (inputLine) {
				parser = parser || new SentenceParser([
					// Detect patterns:
					new SentencePattern(/http (get|post|put|patch|delete) ([^\s]+)/i, { method: 1, url: 2 }, function(m) {
						http(m.method, m.url);
					}),
					new SentencePattern(/http (get|post|put|patch|delete) ([^\s]+) (.+)/i, { method: 1, url: 2, body: 3 }, function(m) {
						http(m.method, m.url, m.body);
					})
				], {
					// Options
				})
				var result = parser.parse(inputLine);
				return result;
			},
            autoComplete: function (inputLeft) {
                var left = inputLeft.toLowerCase();
                var options;
                if (left.startsWith("http ")) {
                    options = ["get", "post", "put", "patch", "delete"];
                    left = left.substr(5);
                }
                else options = [ "http " ];
                var leftLength = left.length;
                if (leftLength === 0) return options;
                else return options.filter((o) => o.startsWith(left)).map((o) => o.substr(leftLength));
            }
		}
    };
    

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
        module.exports = BlindHttp;

	// web browsers
	} else {
		var oldBlindHttp = global.BlindHttp;
		BlindHttp.noConflict = function () {
			global.BlindHttp = oldBlindHttp;
			return BlindHttp;
		};
        global.BlindHttp = BlindHttp;
	}

})(this);
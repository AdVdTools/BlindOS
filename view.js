(function (global, undefined) {

	var BlindView = BlindView || function(viewID, options) {
		if (!viewID) return;

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

		var _viewElement = document.getElementById(viewID);
		_viewElement.classList.add('blind-view');//TODO if missing
		var _output = document.createElement('div');
		_output.classList.add('output-view');
		setTimeout(function () { 
			console.log(_output.offsetWidth+" "+_output.clientWidth)
			_output.style.width = "calc(100% + "+(_output.offsetWidth + _output.offsetLeft - _output.clientWidth) + "px)";
		}, 1);
		_viewElement.insertAdjacentElement('afterbegin', _output);
		//TODO add environment slider, listview, etc
;

		_output.addEventListener('click', function(e) {
			e.stopPropagation();
		}, false);

		function clear() {
			_output.innerHTML = '';
		}

		function output(text) {
			_output.insertAdjacentHTML('beforeEnd', '<pre>'+text+'</pre>');
			_output.scrollTop = _output.scrollHeight - _output.clientHeight;
		}

		return {
			clear: clear,
			output: output
		}
	};

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = BlindView;

	// web browsers
	} else {
		var oldBlindView = global.BlindView;
		BlindView.noConflict = function () {
			global.BlindView = oldBlindView;
			return BlindView;
		};
		global.BlindView = BlindView;
	}

})(this);
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
			_output.style.width = "calc(100% + "+(_output.offsetWidth + _output.offsetLeft - _output.clientWidth) + "px)";
		}, 1);
		_viewElement.insertAdjacentElement('afterbegin', _output);
		//TODO add environment slider, listview, etc


		_output.addEventListener('click', function(e) {
			e.stopPropagation();
		}, false);

		function clear() {
			_output.innerHTML = '';
		}

		function output(out, styleClass) {
			var line;
			if (isElement(out)) line = out;
			else {
				line = document.createElement("pre");
				line.innerText = out;
			}
			if (styleClass) line.classList.add(styleClass);
			_output.insertAdjacentElement('beforeEnd', line);
			_output.scrollTop = _output.scrollHeight - _output.clientHeight;
		}

		//Returns true if it is a DOM element    
		function isElement(o){
			return (typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
				o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string")
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
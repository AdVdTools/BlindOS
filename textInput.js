(function (global, undefined) {
	var parser;

	var TextInput = TextInput || function(blindOS, options) {
		if (!blindOS) { 
			console.error('blindOS reference required.');
			return;
		}
		
		var defaults = {
			inputID: "blind-text-input"
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

		var _history = localStorage.history ? JSON.parse(localStorage.history) : [];
		var _histpos = _history.length;
		var _histtemp = '';
		//TODO limit history length

		// Create terminal and cache DOM nodes;
		var _input = document.getElementById(options.inputID);
		_input.classList.add('blind-text-input');
		_input.insertAdjacentHTML('beforeEnd', '<input class="input-line" autofocus />');
		var _inputLine = _input.querySelector('.input-line');
		
		_input.insertAdjacentHTML('beforeEnd', '<div class="hist-back">&#x25B2;</div><div class="hist-fwd">&#x25BC;</div>');
		var _histBack = _input.querySelector('.hist-back');
		var _histFwd = _input.querySelector('.hist-fwd');
		

		window.addEventListener('click', function(e) {
			_inputLine.focus();
		}, false);

		// Always force text cursor to end of input line.
		_inputLine.addEventListener('click', function(e) {
			//_inputLine.value = _inputLine.value;
		}, false);
		
		_histBack.addEventListener('click', doHistBack, false);
		_histFwd.addEventListener('click', doHistFwd, false);
		
		_input.addEventListener('click', function(e) {
			_inputLine.focus();
		}, false);

		// Handle up/down key presses for shell history and enter for new command.
		_inputLine.addEventListener('keyup', onKeyUp, false);
		_inputLine.addEventListener('keydown', onKeyDown, false);

		window.addEventListener('keydown', function(e) {
			//
		}, false);

		function onKeyUp(e) {
			//console.log(e.keyCode)
			if (e.keyCode == 27) {//ESC
				clear();
				e.stopPropagation();
				e.preventDefault();
			}
			
			if (e.keyCode == 38) doHistBack();//Up
			if (e.keyCode == 40) doHistFwd();//Down
		}
		
		function doHistBack() {
			if (_history.length) {
				if (_history[_histpos]) {
					_history[_histpos] = _inputLine.value;
				}
				else {
					_histtemp = _inputLine.value;
				}
			
				_histpos--;
				if (_histpos < 0) {
					_histpos = 0;
				}
				
				_inputLine.value = _history[_histpos] ? _history[_histpos] : _histtemp;
				
				_inputLine.value = _inputLine.value;
			}
		}
		
		function doHistFwd() {
			if (_history.length) {
				if (_history[_histpos]) {
					_history[_histpos] = _inputLine.value;
				}
				else {
					_histtemp = _inputLine.value;
				}
				
				_histpos++;
				if (_histpos > _history.length) {
					_histpos = _history.length;
				}
				
				_inputLine.value = _history[_histpos] ? _history[_histpos] : _histtemp;
				
				_inputLine.value = _inputLine.value;
			}
		}

		function onKeyDown(e) {
			if (e.keyCode == 13) processNewCommand();
			if (e.keyCode == 38 || e.keyCode == 40) e.preventDefault();
		}

		function processNewCommand() {
			var inputline = _inputLine.value;

			// Save shell history.
			if (inputline) {
				_history[_history.length] = inputline;
				localStorage['history'] = JSON.stringify(_history);
				_histpos = _history.length;
			}

			// Hide command line until we're done processing input.
			_inputLine.classList.add('hidden');

			// Clear/setup line for next input.
			_inputLine.value = '';

			blindOS.executeCommand(inputline);

			// Show the command line.
			_inputLine.classList.remove('hidden');
		}

		function clear() {
			_inputLine.value = '';
		}

		var textInput = {
			clear: clear,
			execute: function (inputLine) {
				parser = parser || new SentenceParser([
					// Detect patterns:
					new SentencePattern(/history/i, { }, function(m) {
						for (var h = 0; h < _history.length; h++) {
							blindOS.output(_history[h]);
						}
					}),
					new SentencePattern(/clear history/i, { }, function(m) {
						localStorage['history'] = JSON.stringify(_history = []);
						_histpos = 0;
					})
				], {
					// Options
				})
				var result = parser.parse(inputLine);
				return result;
			}
		}
		return textInput
	};

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = TextInput;

	// web browsers
	} else {
		var oldTextInput = global.TextInput;
		TextInput.noConflict = function () {
			global.TextInput = oldTextInput;
			return TextInput;
		};
		global.TextInput = TextInput;
	}

})(this);
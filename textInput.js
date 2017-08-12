(function (global, undefined) {

	var TextInput = TextInput || function(inputID, options) {
		if (!inputID) return;

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

		var _history = localStorage.history ? JSON.parse(localStorage.history) : [];
		var _histpos = _history.length;
		var _histtemp = '';

		// Create terminal and cache DOM nodes;
		var _input = document.getElementById(inputID);
		_input.classList.add('blind-text-input');
		_input.insertAdjacentHTML('beforeEnd', '<input class="input-line" autofocus />');
		var _inputLine = _input.querySelector('.input-line');

		window.addEventListener('click', function(e) {
			_inputLine.focus();
		}, false);

		// Always force text cursor to end of input line.
		_inputLine.addEventListener('click', function(e) {
			_inputLine.value = _inputLine.value;
		}, false);
		
		_input.addEventListener('click', function(e) {
			_inputLine.focus();
		}, false);

		// Handle up/down key presses for shell history and enter for new command.
		_inputLine.addEventListener('keyup', onKeyUp, false);
		_inputLine.addEventListener('keydown', onKeyDown, false);

		window.addEventListener('keyup', function(e) {
			_inputLine.focus();
			e.stopPropagation();
			e.preventDefault();
		}, false);

		function onKeyUp(e) {
			historyHandler(e);//TODO break down
		}

		function historyHandler(e) {
			// Clear command-line on Escape key.
			if (e.keyCode == 27) {
				_inputLine.value = '';
				e.stopPropagation();
				e.preventDefault();
			}

			if (_history.length && (e.keyCode == 38 || e.keyCode == 40)) {
				if (_history[_histpos]) {
					_history[_histpos] = _inputLine.value;
				}
				else {
					_histtemp = _inputLine.value;
				}

				if (e.keyCode == 38) {
					// Up arrow key.
					_histpos--;
					if (_histpos < 0) {
						_histpos = 0;
					}
				}
				else if (e.keyCode == 40) {
					// Down arrow key.
					_histpos++;
					if (_histpos > _history.length) {
						_histpos = _history.length;
					}
				}

				_inputLine.value = _history[_histpos] ? _history[_histpos] : _histtemp;

				// Move cursor to end of input.
				_inputLine.value = _inputLine.value;
			}
		}

		function onKeyDown(e) {
			if (e.keyCode == 13) processNewCommand();
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

			if (textInput.onCommand) textInput.onCommand(inputline);

			// Show the command line.
			_inputLine.classList.remove('hidden');
		}

		function clear() {
			_inputLine.value = '';
		}

		var textInput = {
			clear: clear,
			onCommand: null,
            onAutoComplete: null,
            getAutoCompleteOptions: null
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
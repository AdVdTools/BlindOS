(function (global, undefined) {

	var Terminal = Terminal || function(inputID, outputID, options) {
		if (!inputID) return;//TODO check outputID?

		var defaults = {
			welcome: '',
			prompt: 'Prompt&gt;'
		};

		var options = options || defaults;
		options.welcome = options.welcome || defaults.welcome;
		options.prompt = options.prompt || defaults.prompt;

		var _currentPrompt = options.prompt;

        console.log(arguments)// all the function arguments, including arguments beyond those specified in the signature

		var extensions = Array.prototype.slice.call(arguments, 3);

		var _history = localStorage.history ? JSON.parse(localStorage.history) : [];
		var _histpos = _history.length;
		var _histtemp = '';

		// Create terminal and cache DOM nodes;
		var _terminalInput = document.getElementById(inputID);
		_terminalInput.classList.add('terminal');//TODO if missing
		_terminalInput.classList.add('terminal-input');
		_terminalInput.insertAdjacentHTML('beforeEnd',
			/*'<div class="background"><div class="interlace"></div></div>' +*/
			'<div class="prompt">' +
			/*'<output></output>' +*/
			'<span>' + _currentPrompt + '</span><input class="input-line" autofocus />' +
			'</div>');
		var _prompt = _terminalInput.querySelector('.prompt');
		var _promptText = _prompt.querySelector('span');
		var _inputLine = _prompt.querySelector('.input-line');

		var _terminalOutput = document.getElementById(outputID);
		_terminalOutput.classList.add('terminal');//TODO if missing
		_terminalOutput.classList.add('terminal-output');
		var _output = document.createElement('div');
		_output.classList.add('output-view');
		_terminalOutput.insertAdjacentElement('afterbegin', _output);
		/*var _prompt = document.createElement('div');
		//_prompt.//TODO make row?
		_prompt.classList.add('prompt');
		_prompt.insertAdjacentText('afterbegin', 'Prompt>');
		var _inputLine = document.createElement('input');
		_prompt.insertAdjacentElement('beforebegin', _inputLine)
		_terminalInput.insertAdjacentElement('beforeEnd', _prompt);*/
		
		/*var _container = _terminal.querySelector('.container');
		var _inputLine = _container.querySelector('.input-line');
		var _cmdLine = _container.querySelector('.input-line .cmdline');
		var _output = _container.querySelector('output');
		var _prompt = _container.querySelector('.prompt');
		var _background = document.querySelector('.background');*/

		/*
		// Hackery to resize the interlace background image as the container grows.
		_output.addEventListener('DOMSubtreeModified', function(e) {
			// Works best with the scroll into view wrapped in a setTimeout.
			setTimeout(function() {
				_cmdLine.scrollIntoView();
			}, 0);
		}, false);
		*/

		if (options.welcome) {
			output(options.welcome);
		}

		window.addEventListener('click', function(e) {
			_inputLine.focus();
		}, false);

		_output.addEventListener('click', function(e) {
			e.stopPropagation();
		}, false);

		// Always force text cursor to end of input line.
		_inputLine.addEventListener('click', function(e) {
			_inputLine.value = _inputLine.value;
		}, false);
		
		_terminalInput.addEventListener('click', function(e) {
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

			output(_currentPrompt + ' ' + inputline);

			// Hide command line until we're done processing input.
			_inputLine.classList.add('hidden');

			// Clear/setup line for next input.
			_inputLine.value = '';

			// Parse out command, args, and trim off whitespace.
			if (inputline && inputline.trim()) {
				var args = inputline.split(' ').filter(function(val, i) {
					return val;
				});
				var cmd = args[0];
				args = args.splice(1); // Remove cmd from arg list.
			}

			if (cmd) {
				var response = false;
				for (var index in extensions) {
					var ext = extensions[index];
					if (ext.execute) response = ext.execute(cmd, args);
					if (response !== false) break;
				}
				if (response === false) output(cmd + ': command not found');
			}

			// Show the command line.
			_inputLine.classList.remove('hidden');
		}

		function clear() {
			_output.innerHTML = '';
			_inputLine.value = '';
			//_background.style.minHeight = '';
		}

		function output(html) {
			_output.insertAdjacentHTML('beforeEnd', html);
			_output.insertAdjacentHTML('beforeEnd', '<br>');
			//_cmdLine.scrollIntoView();
		}

		return {
			clear: clear,
			output: output,
			setPrompt: function(prompt) { _currentPrompt = prompt; _promptText.innerHTML = _currentPrompt; },
			getPrompt: function() { return _currentPrompt; },
			version: '1.0.0'
		}
	};

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = Terminal;

	// web browsers
	} else {
		var oldTerminal = global.Terminal;
		Terminal.noConflict = function () {
			global.Terminal = oldTerminal;
			return Terminal;
		};
		global.Terminal = Terminal;
	}

})(this);
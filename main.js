window.onload = function() {
    var terminal = new Terminal('term-input', 'term-output', {}, {
        execute: function(cmd, args) {
            switch (cmd) {
                case 'clear':
                    terminal.clear();
                    break;

                case 'help':
                    terminal.output ('Commands: clear, help, prompt, echo, ver or version<br>More help available <a class="external" href="http://github.com/SDA/terminal" target="_blank">here</a>');
                    break;
                    
                case 'prompt':
                    if (args && args[0]) {
                        if (args.length > 1) terminal.ouput('Too many arguments');
                        else { terminal.setPrompt(args[0]); }
                    }
                    else terminal.output(terminal.getPrompt());
                    break;

                case 'echo':
                    terminal.output(args.join(' '))
                    break;

                case 'ver':
                case 'version':
                    terminal.output(terminal.version);
                    break;

                default:
                    // Unknown command.
                    return false;
            };
            return true;
        }
    });
}

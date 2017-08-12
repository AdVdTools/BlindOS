window.onload = function() {
    var ext = {
        execute: function(cmd, args) {
            switch (cmd) {
                case 'extended':
                    return this.execute(args[0], args.splice(1));
                case 'custom':
                    blindOS.output ('CUSTOM!');
                    break;

                case 'echo'://This one is hidden by default echo
                    blindOS.output('CustomEcho: '+args.join(' '))
                    break;

                default:
                    // Unknown command.
                    return false;
            };
            return true;
        }
    }

    var blindOS = new BlindOS({}, ext);
    
    document.head.appendChild(loadJS("textInput.js", function () {
        blindOS.connect('text-input', new TextInput('blind-text-input'));
    },
    function() {
        console.log("ReadyStateChange "+arguments);
    }));
    
    document.head.appendChild(loadJS("view.js", function () {
        blindOS.connect('view', new BlindView('blind-view'));
    },
    function() {
        console.log("ReadyStateChange "+arguments);//TODO when is this called?
    }));

    document.head.appendChild(loadJS("sentenceParser.js"));
}

function loadJS(url, onload, onreadystatechange) {
    var scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = onload;
    scriptTag.onreadystatechange = onreadystatechange;
    return scriptTag;
}

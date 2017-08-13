window.onload = function() {
    var ext = {
        parser: null,
        execute: function(inputLine) {
            ext.parser = ext.parser || new SentenceParser([
                // Detect patterns:
                new SentencePattern(/extended (.+)/i, { command: 1 }, function(s, m) {
                    var res = ext.execute(m.command);
                    if (!res) blindOS.output('extended command not found');
                    return res;
                }),
                new SentencePattern(/custom/i, { }, function(s, m) {
                    blindOS.output ('CUSTOM!');
                }),
                new SentencePattern(/echo (.+)/i, { text: 1 }, function(s, m) {
                    blindOS.output('Extended: '+m.text);
                })
            ], {
                // Options
            })
            var result = ext.parser.parse(inputLine);
            return result;
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

    document.head.appendChild(loadJS("extensions/todo.js", function () {
        blindOS.connect('extension', new BlindTODO(blindOS));
        //blindOS.connect('extension', new BlindTODO(blindOS, { name: 'advd todos', storage: 'my.todo.list' }));
    }));
    //TODO create todo extension (todo "task", todo list, working with lists?)
    //TODO try catch execute and log errors in view
    //TODO allow asking for input
}

function loadJS(url, onload, onreadystatechange) {
    var scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = onload;
    scriptTag.onreadystatechange = onreadystatechange;
    return scriptTag;
}

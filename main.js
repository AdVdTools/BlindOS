window.onload = function() {
    var ext = {
        parser: null,
        execute: function(inputLine) {
            ext.parser = ext.parser || new SentenceParser([
                // Detect patterns:
                new SentencePattern(/extended (.+)/i, { command: 1 }, function(m) {
                    var res = ext.execute(m.command);
                    if (!res) blindOS.output('extended command not found');
                    return res;
                }),
                new SentencePattern(/custom/i, { }, function(m) {
                    blindOS.output ({
                        toString: function() {
                            return 'CUSTOM!';
                        },
                        toVoiceString: function() {
                            return 'Voice!';
                        }
                    });
                }),
                new SentencePattern(/(capman)?(\s?ferran)?( .+)?/i, { }, function(m, s, r) {
                    var iframe = document.createElement("iframe");
                    iframe.src = "https://www.youtube.com/embed/x8s09GKkbd0?autoplay=1";
                    //blindOS.output(JSON.stringify(r));
                    if (r[3]) iframe.style.cssText = r[3].slice(1);
                    if (!iframe.style.display) iframe.style.display = "block";
                    iframe.style.position = "relative";
                    blindOS.output(iframe);
                }),
                new SentencePattern(/worker (start|stop)/i, { action: 1 }, function (m) {
                    if (m.action === "start") {
                        if(typeof(Worker) !== "undefined") {
                            if(typeof(worker) == "undefined") {
                                worker = new Worker("extensions/workerTest.js");
                            }
                            var line = document.createElement("pre")
                            worker.onmessage = function(event) {
                                line.innerText = "Worker: "+event.data;
                            };
                            blindOS.output(line, "special")
                        } else {
                            blindOS.output("Sorry! No Web Worker support.");
                        }
                    }
                    else if (m.action === "stop") {
                        worker.terminate();
                        worker = undefined;
                    }
                }),
                new SentencePattern(/echo (.+)/i, { text: 1 }, function(m) {
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
        blindOS.connect('extension', new TextInput(blindOS, { inputID: 'blind-text-input' }));
    },
    function() {
        console.log("ReadyStateChange "+arguments);
    }));

    document.head.appendChild(loadJS("voiceSynth.js", function () {
        if (!VoiceSynth) return;
        var synth = new VoiceSynth(blindOS);
        blindOS.connect('voice-synth', synth);
        blindOS.connect('extension', synth);
    },
    function() {
        console.log("ReadyStateChange "+arguments);
    }));
    
    document.head.appendChild(loadJS("view.js", function () {
        blindOS.connect('view', new BlindView('blind-view'));//TODO should reference blindOS?
    },
    function() {
        console.log("ReadyStateChange "+arguments);//TODO when is this called?
    }));
    
    document.head.appendChild(loadJS("extensions/http.js", function () {
    	blindOS.connect('extension', new BlindHttp(blindOS));
    }));

    document.head.appendChild(loadJS("extensions/javascript.js", function () {
        blindOS.connect('extension', new BlindJS(blindOS));
    }));
    
    document.head.appendChild(loadJS("extensions/todo.js", function () {
    	blindOS.connect('extension', new BlindTODO(blindOS));
    }));
    //TODO create todo extension (todo "task", todo list, working with lists?)
    //TODO try catch execute and log errors in view
    //TODO allow asking for input
}

//TODO move to BlindOS so it can't be used from console
function loadJS(url, onload, onreadystatechange) {
    var scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = onload;
    scriptTag.onreadystatechange = onreadystatechange;
    return scriptTag;
}
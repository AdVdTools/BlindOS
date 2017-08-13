(function (global, undefined) {
    var parser;
    var subParser;

	var BlindTODO = BlindTODO || function(blindOS, options) {
        if (!blindOS) { 
            console.error('blindOS reference required.');
            return;
        }
        console.log(typeof this);
        console.log(typeof blindOS);

		var defaults = {
            storage: 'blindtodos'//TODO allow sub"folders"
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

        console.log(localStorage)
        
        var _todoStorage;
        try {
            _todoStorage = JSON.parse(localStorage[options.storage]);
        }
        catch(err) {
            console.warn(err)
            _todoStorage = {};
        }
        console.log(_todoStorage)
        var _todosList = _todoStorage.lists;
        if (!_todosList) {
            _todosList = _todoStorage.lists = [];
        }

        function create(name, path) {
            _todosList.push({ name: name, path: path });
            console.log(_todosList)
            _todoStorage[path] = [];
            localStorage[options.storage] = JSON.stringify(_todoStorage); 
        }

        function remove(name) {
            var index = _todosList.findIndex(function(l) { return l.name === name })
            console.log(index+" "+name)
            var path;
            if (index >= 0) path = _todosList.splice(index, 1)[0].path;
            console.log(_todosList)
            if (path) _todoStorage[path] = undefined;
            localStorage[options.storage] = JSON.stringify(_todoStorage); 
        }

        function listLists() {
            for(var i = 0; i < _todosList.length; i++) {
                blindOS.output(_todosList[i].name+' at '+_todosList[i].path);
            }
        }

        function list(list) {
            if (!list) list = 'something'; //TODO get current;
            var path = list.path;
            if (!path) {
                var targetList = _todosList.find(function(l) { return l.name === list })
                path = targetList ? targetList.path : null;
            }
            if (path) {
                var todos = _todoStorage[path] || [];
                console.log(todos)
                for(var i = 0; i < todos.length; i++) {
                    blindOS.output(todos[i]);
                }
            }
            else {
                blindOS.output(list+" doesn\'t exist");
            }
        }

        function add(task, list) {
            if (!list) list = 'something'; //TODO get current;
            var path = list.path;
            if (!path) {
                var targetList = _todosList.find(function(l) { return l.name === list })
                path = targetList ? targetList.path : null;
            }
            if (path) {
                var todos = _todoStorage[path] || (_todoStorage[path] = []);
                todos.push(task);
                console.log(todos)
                localStorage[options.storage] = JSON.stringify(_todoStorage); 
            }
            else {
                blindOS.output(list+" doesn\'t exist");
            }
        }

		shelf = {
            execute: function(inputLine) {
                parser = parser || new SentenceParser([
                    // Detect patterns:
                    new SentencePattern(/todo/i, { }, function(s, m) {
                        blindOS.output ('This is TODO');
                    }),
                    new SentencePattern(/list todos?/i, { }, function(s, m) {
                        list()
                    }),
                    new SentencePattern(/todo (.+)/i, { args: 1 }, function(s, m) {
                        //execute sub parser
                        subParser = subParser || new SentenceParser([
                            new SentencePattern(/create (.+)/i, { opts: 1 }, function(s, m) {
                                var match = /(.+) at (.+)/i.exec(m.opts);
                                var name, path;
                                if (!match) path = (name = m.opts).replace(" ", "_");
                                else { name = match[1]; path = match[2].replace(" ", "_"); }
                                create(name, path)
                            }),
                            new SentencePattern(/(remove|delete) (.+)/i, { name: 2 }, function(s, m) {
                                remove(m.name)
                            }),
                            new SentencePattern(/list/i, {}, function(s, m) {
                                list()
                            }),
                            new SentencePattern(/list lists/i, {}, function(s, m) {
                                listLists()
                            }),
                            new SentencePattern(/list (.+)/i, { name: 1 }, function(s, m) {
                                list(m.name)
                            }),
                            new SentencePattern(/"(.+)"/i, { task: 1 }, function(s, m) {
                                blindOS.output('todo add '+m.task);// adds to current
                            }),//TODO specific list selection here
                            new SentencePattern(/(.+)/i, { task: 1 }, function(s, m) {
                                blindOS.output('todo add '+m.task);// adds to current
                                add(m.task)
                            })//TODO complete & add to specific
                        ], {})
                        var result = subParser.parse(m.args)
                        if (!result) {//Don't return false, this is being handled and it's an error
                            blindOS.output('Couldn\'t parse TODO command ('+m.args+')');
                        }
                    })
                ], {
                    // Options
                })
                var result = parser.parse(inputLine);
                return result;
            }
        }
        return shelf;
    };

	// node.js
	if (typeof module !== 'undefined' && module.exports) {
        module.exports = BlindTODO;

	// web browsers
	} else {
		var oldBlindTODO = global.BlindTODO;
		BlindTODO.noConflict = function () {
			global.BlindTODO = oldBlindTODO;
			return BlindTODO;
		};
        global.BlindTODO = BlindTODO;
	}

})(this);
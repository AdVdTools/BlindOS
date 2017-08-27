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
            storage: 'todos'
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
        
        var _todoList;
        try {
            _todoList = JSON.parse(localStorage[options.storage]);
        }
        catch(err) {
            console.warn(err)//TODO native dialog call to decide if storage should be overriden
            _todoList = [];
        }

        function list() {
            for(var i = 0; i < _todoList.length; i++) {
                blindOS.output(_todoList[i]);
            }
            blindOS.current.list=_todoList;//TODO create list object with edit options
            if (_todoList.length == 0) blindOS.output('Nothing TODO');
        }

        function add(task) {
            _todoList.push(task);
            console.log(_todoList)
            localStorage[options.storage] = JSON.stringify(_todoList); 
            blindOS.current.todoList=_todoList;
        }

        function remove(task) {
            var index = _todoList.findIndex(function(t) { return t === task })
            console.log(index+" "+task)
            if (index >= 0) _todoList.splice(index, 1);
            console.log(_todoList)
            localStorage[options.storage] = JSON.stringify(_todoList); 
        }

        function complete(task) {
            remove (task);//TODO make more complex tasks: { descr: ..., date: ..., tag: ..., done: true }
            //TODO convert word (first, last, etc) to index (0, 1, -1)
            //TODO if task is index complete index, else search (startsWith)
        }

        var submodule = {
            execute: function(inputLine) {
                subParser = subParser || new SentenceParser([
                    new SentencePattern(/(remove|delete) (.+)/i, { name: 2 }, function(m) {
                        remove(m.name)
                    }),
                    new SentencePattern(/list/i, {}, function(m) {
                        list()
                    }),
                    //new SentencePattern(/list (.+)/i, { filter: 1 }, function(m) {
                    //    list(m.filter)
                    //}),
                    new SentencePattern(/add (.+)/i, { task: 1 }, function(m) {
                        add(m.task)
                    }),
                    new SentencePattern(/complete (.+)/i, { task: 1 }, function(m) {
                        complete(m.task)
                    }),
                    new SentencePattern(/(.+) is done/i, { task: 1 }, function(m) {
                        complete(m.task)
                    })
                    //TODO reuse maps and functions
                ], {})
                var result = subParser.parse(inputLine)
                if (!result) {//Don't return false, this is being handled and it's an error
                    blindOS.output('Couldn\'t parse TODO command ('+inputLine+')');
                }
            }
        }

		var shelf = {
            execute: function(inputLine) {
                parser = parser || new SentenceParser([
                    // Detect patterns:
                    new SentencePattern(/todo/i, { }, function(m) {
                        blindOS.output ('This is TODO');//TODO launch sub env
                        blindOS.current.submodule = submodule;//TODO handle overriding!
                    }),
                    new SentencePattern(/list todos?/i, { }, function(m) {
                        list()
                    }),
                    new SentencePattern(/todo (.+)/i, { args: 1 }, function(m) {
                        //execute submodule
                        submodule.execute(m.args)
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
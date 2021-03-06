(function(){
	var onLoadModules = (function() {
		var name = 'loadedModules',
			callbacks = [],
			arr = app[name],
			_arr,
			obj;

		arr = app[name] = Array.isArray(arr) ? arr : [];
		_arr = arr;
		obj = app[name] = {};
		obj.values = _arr;

		obj.push = function() {
			var args = [].slice.call(arguments, 0);
			_arr.push(args[0]);
			tryCallbacks();
		};

		var tryCallbacks = function() {
			for(var i=callbacks.length-1;i>=0;i--) {
				if(testConditions(callbacks[i].conditions)) {
					var cb = callbacks[i].callback;
					callbacks.splice(i, 1);
					setTimeout(cb, 0);
				}
			}
		}

		var testConditions = function(conditions) {
			for(i in conditions) {
				if(_arr.indexOf(conditions[i]) === -1) {
					return false;
				}
			}
			return true;
		}

		var registerCallback = function(conditions, callback) {
			callbacks.push({
				conditions: conditions,
				callback: callback
			});
			tryCallbacks();
		}

		obj.registerCallback = registerCallback;

		return registerCallback;
	})();

	app.loadedModules.registerCallback(['html', 'init'], chooseAppByUrl);
	app.loadedModules.push('init');
})();

function chooseAppByUrl() {
	var metric = location.hostname;
	var path = location.pathname;
	if(metric == 'localhost') {
		metric = path;
	}
	if(metric.indexOf('www.tak-jim-to-rekni.cz') > -1) {
		app.moduleName = 'rekni';
		app.moduleBody = document.getElementById('rekni');
	}
	else {
		app.moduleName = 'kolarikovi';
		app.moduleBody = document.getElementById('kolarikovi');
	}
	app.moduleBody.style.display = 'flex';
	app.loadedModules.push('app select');
}
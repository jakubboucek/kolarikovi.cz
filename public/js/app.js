Raven.config('https://77f183656b4847289abc39143c2bbd10@sentry.io/173401').install();

(function(){
	app.data = null;
	app.module = null;

	// Init
	app.loadedModules.registerCallback(['app'], function(){
		app.module = new app.modules[app.moduleName](
			app.moduleBody
		);
		fetchData();
		fetchAuth();
		initGui();
	});

	document.addEventListener('DOMContentLoaded', function() {
		app.loadedModules.push('DOMContentLoaded');
	});

	function fetchData() {
		firebase.database().ref('live')
			.once('value')
			.then(function(snapshot){
				app.data = snapshot.val();
				app.loadedModules.push('data');
				console.log('Live data fetched');
			})
			.catch(function(error){
				app.loadedModules.push('data');
				console.log('Live data not accessible');
			});
	}

	function saveData(path, value) {
		firebase.database().ref('live')
			.child(path)
			.set(value);
	}

	function fetchAuth() {
		firebase.auth().onAuthStateChanged(function(user, error) {
			if(error) {
				throw error;
			}

			if(user) {
				firebase.database().ref('admins').child(user.uid)
				.once('value')
				.then(function(snapshot){
					changeAuthState(snapshot.val() === true ? user : null);
				});
			}
			else {
				changeAuthState(null);
			}
		});
	}

	function changeAuthState(user) {
		var isLoggedIn = app.isLoggedIn = !!user;
		app.user = user;

		var nav = document.querySelector('nav');

		if (user) {
			nav.classList.add('loud');
			nav.classList.remove('silent');
			document.querySelector('.logged-out').style.display = 'none';
			document.querySelector('.logged-in').style.display = 'block';
		} else {
			nav.classList.remove('loud');
			nav.classList.add('silent');
			document.querySelector('.logged-out').style.display = 'block';
			document.querySelector('.logged-in').style.display = 'none';
		}
	}


	function initGui() {
		document.querySelector('#login .logged-out a.button').addEventListener('click', function(e) {
			e.preventDefault();
			login();
		});
		document.querySelector('#login .logged-in a.button').addEventListener('click', function(e) {
			e.preventDefault();
			logout();
		});
	}

	function login() {
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).catch(function(error) {
			console.log('Unable to log');
			throw error;
		});
	}

	function logout() {
		firebase.auth().signOut();
	}

	app.modules = {
		rekni: function(body){
			var player;

			var init = function(){
				initYoutubePlayer();

			}

			var redirectToTarget = function() {
				location.href = 'https://www.kolarikovi.cz/';
			}

			var initYoutubePlayer = function() {

				//global callback
				onYouTubeIframeAPIReady = function () {
					app.loadedModules.push('youtube');
				}

				var tag = document.createElement('script');
				tag.src = "https://www.youtube.com/iframe_api";
				document.head.appendChild(tag);


				app.loadedModules.registerCallback(['youtube', 'data'], function(){
					if(app.data) {
						showYoutubePlayer(app.data.videoId);
					}
				});

				app.loadedModules.registerCallback(['data'], function() {
					document.querySelector('#video-panel').style.display = '';
					document.querySelector('#video-id-save').addEventListener('click', function(e) {
						saveVideoId();
					});
					if(app.data) {
						document.querySelector('#video-id').value = app.data.videoId;
					}
				});
			}

			var saveVideoId = function() {
				var id = document.querySelector('#video-id').value;
				var button = document.querySelector('#video-id-save');
				saveData('videoId', document.querySelector('#video-id').value);
			}

			var showYoutubePlayer = function (videoId) {
				//IE bug fix
				if (!window.location.origin) {
					window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
				}
				var dimensions = getDimensions(1280,720);
				player = new YT.Player('youtubePlayer', {
					width: dimensions.width,
					height: dimensions.height,
					videoId: videoId,
					events: {
						onReady: onPlayerReady,
						onStateChange: onPlayerStateChange
					},
					playerVars: {
						autoplay: true,
						enablejsapi: true,
						hl: 'cs',
						origin: window.location.origin,
						rel: false
					}
				});
				window.addEventListener('resize', function() {
					var dimensions = getDimensions(1280,720);
					var playerEl = body.querySelector('#youtubePlayer');
					playerEl.width = dimensions.width;
					playerEl.height = dimensions.height;
				});
			}

			var onPlayerReady = function(event) {
				body.querySelector('p').style.display = 'none';
				body.querySelector('#youtubePlayer').style.display = 'block';
				setTimeout(startPrefetching, 50000);
			}
			var onPlayerStateChange = function(event) {
				if(event.data === YT.PlayerState.ENDED) {
					body.querySelector('p').style.display = 'block';
					body.querySelector('#youtubePlayer').style.display = 'none';
					redirectToTarget();
				}
			}

			var getDimensions = function (baseWidth, baseHeight) {
				var width = Math.min(baseWidth, body.clientWidth);
				var height = Math.min(baseHeight, body.clientHeight);
				var requiredRatio = baseWidth / baseHeight;
				var ratio = width / height;

				if(ratio < requiredRatio) {
					height = width / requiredRatio;
				} else if(ratio > requiredRatio) {
					width = height * requiredRatio;
				}
				return {
					width: width,
					height: height,
				};
			}

			var startPrefetching = function() {
				var dnss = [
					'www.kolarikovi.cz',
					'www.kolarik.cz',
					'www.kolarikova.cz',
				];
				var urls = [
					'https://www.kolarikovi.cz/',
					'https://www.kolarikovi.cz/js/init.js',
					'https://www.kolarikovi.cz/__/firebase/4.0.0/firebase-app.js',
					'https://www.kolarikovi.cz/__/firebase/4.0.0/firebase-auth.js',
					'https://www.kolarikovi.cz/__/firebase/4.0.0/firebase-database.js',
					'https://www.kolarikovi.cz/__/firebase/4.0.0/firebase-storage.js',
					'https://www.kolarikovi.cz/__/firebase/init.js',
					'https://www.kolarikovi.cz/js/app.js',
					'https://www.kolarikovi.cz/css/app.css'
				];

				for(i in dnss) {
					var tag = document.createElement('link');
					tag.rel = 'dns-prefetch';
					tag.href = dnss[i];
					document.head.appendChild(tag);
				}
				for(i in urls) {
					var tag = document.createElement('link');
					tag.rel = 'prefetch';
					tag.href = urls[i];
					document.head.appendChild(tag);
				}
			}

			init();
		},
		kolarikovi: function(body){

		}
	};

	app.loadedModules.push('app');
})();

Raven.config('https://77f183656b4847289abc39143c2bbd10@sentry.io/173401').install();

(function(){

	var db = firebase.database();
	var configRef = db.ref('config');
	config = null;
	configRef.once('value', function(configSnapshot){
		config = configSnapshot.val();
		app.loadedModules.push('config');
	});

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			document.getElementById('logged-out').style.display = 'none';
			document.getElementById('logged-in').style.display = 'block';
			var userRef = db.ref('users/' + user.uid);
			userRef.once('value', function(userSnapshot){
				var val = userSnapshot.val()
				if(!val) {
					userRef.set({
						name: user.displayName,
						email: user.email,
						photoURL: user.photoURL,
					});
				}

			}, function(e){console.log(e)});
		} else {
			document.getElementById('logged-out').style.display = 'block';
			document.getElementById('logged-in').style.display = 'none';
		}
		app.loadedModules.push('auth');
	});

	document.addEventListener('DOMContentLoaded', function() {
		app.loadedModules.push('dom');
		init();
	});

	function init() {
		document.getElementById('login-button').addEventListener('click', function(e) {
			e.preventDefault();
			login();
		});
		document.getElementById('logout-button').addEventListener('click', function(e) {
			e.preventDefault();
			logout();
		});
	}

	function login() {
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
			// This gives you a Google Access Token. You can use it to access the Google API.
			var token = result.credential.accessToken;
			// The signed-in user info.
			var user = result.user;
			// ...
		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;
			// The firebase.auth.AuthCredential type that was used.
			var credential = error.credential;
			// ...
		});
	}

	function logout() {
		firebase.auth().signOut();
	}

})();

app.loadedModules.push('app');
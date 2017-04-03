
/* JavaScript content from js/lockController.js in folder common */
(function() {

	var app = angular.module('lock.controller', []);



	app.controller('LockCtrl', function($scope, $state) {

		$scope.goLogin = function() {
			$state.go("login");
		};

		$scope.goSignup = function() {
			$state.go("signup");
		};
	});

	app.controller('SingupCtrl', function($scope, $state) {


		// bind html input element to this scoped variable
		$scope.data = {};

		// when the user click the signup button
		$scope.signup = function() {

			// empty the info section
			$("#infoH").text(" ");


			// stop every thing if the form is not filled
			// must be changed to more convenient way
			if (!checkForm())
				return;

			// check user name with a timeout
			// this is an object so it can work properly
			var userNotChecked = {value: true};	
			checkUserName(userNotChecked, $scope.data.username);


			setTimeout(function() {

				if (!userNotChecked.value) {
					$("#infoH").text("Change Username!");
				} else {

					var emailNotChecked = {value: true};
					// split email
					var splitedEmail = splitEmail($scope.data.email);

					// debug only
					$scope.data.local_part = splitedEmail.local_part;
					$scope.data.domain_name = splitedEmail.domain_name;
					$scope.data.domain_tld = splitedEmail.domain_tld;
					checkEmail(emailNotChecked, splitedEmail);

					setTimeout(function() {
						if (!emailNotChecked.value) {
							$("#infoH").text("Change Email!");
						}
						else {

							var saltAndPass = {
								salt: "",
							    hash: ""
							};
							var passwordGenerated = {value: true};
			
							generatedSaltandHash($scope.data.password, saltAndPass, passwordGenerated);


							setTimeout(function() {
								if (!passwordGenerated.value) {

									// get the salt and password
									$scope.data.salt = saltAndPass.salt;
									$scope.data.password = saltAndPass.hash;

									signHimUp($scope.data);

										setTimeout(function() {
											$state.go("lock");
										}, 2000);

								} else {
									$("#infoH").text("Something went wrong. Repeat please!");
								}
							}, 2000);
						}
					}, 2000);
				}
			}, 2000);
		};

		// TODO: here
		function signHimUp(credentials) {
			var invocationRegisterData = {
				adapter: 'ConnectToDatabase',
				procedure: 'registerUser',
				parameters: [
					credentials.name,
					credentials.lastName,
					credentials.username,
					credentials.password,
					credentials.salt,
					credentials.local_part,
					credentials.domain_name,
					credentials.domain_tld
				]
			};
			WL.Client.invokeProcedure(invocationRegisterData, {
				onSuccess: successRegisteryFunction,
				onFailure: failureRegisteryFunction
			});
			function successRegisteryFunction(response) {
				$("#infoH").text("Welcome Home =D");
				
			}
			function failureRegisteryFunction(response) {
				console.log("failed to ge to user_registery");
				console.log(response);
			}
		}


		function generatedSaltandHash(password, saltAndPass, finished) {
			// generate salt
			var invocationSalt = {
					adapter: 'PasswordAdapter',
					procedure: 'saltAndHash',
					parameters: [ password ]
			};
			WL.Client.invokeProcedure(invocationSalt, {
				onSuccess: successSaltFunction,
				onFailure: failureSaltFunction
			});

			function successSaltFunction(response) {
				
				saltAndPass.salt = response.responseJSON.salt;
				saltAndPass.hash = response.responseJSON.hash;
				
				finished.value = false;
			}
			function failureSaltFunction(response) {
				console.log(response);
			}
		}

		function checkEmail(emailNotChecked, splitedEmail) {

			var invocationEmailData = {
					adapter: 'ConnectToDatabase',
					procedure: 'getUserByEmail',
					parameters: [
						splitedEmail.local_part, 
						splitedEmail.domain_name, 
						splitedEmail.domain_tld
					]
			};
			WL.Client.invokeProcedure(invocationEmailData, {
				onSuccess: successEmailFunction,
				onFailure: failureEmailFunction
			});
			function successEmailFunction(response) {
				if (response.responseJSON.resultSet.length != 0) {
					$("#infoH").text("Invalid email!");
					emailNotChecked.value = false;
				}
			}
			function failureEmailFunction(response) {
				console.log(response);
				emailNotChecked = false;
			}
		}


		function checkUserName(userNotChecked, username) {
			// check for the username
			// the userNotChecked is way to turn this asynch procedure to sync
			// with the timeout
			var invocationUserData = {
					adapter: 'ConnectToDatabase',
					procedure: 'getUserByUserName',
					parameters: [ username ]
			};
			WL.Client.invokeProcedure(invocationUserData, {
				onSuccess: successUserFunction,
				onFailure: failureUserFunction
			});
			function successUserFunction(response) {
				if (response.responseJSON.resultSet.length != 0) {
					$("#infoH").text("Invalid username!");
					userNotChecked.value = false;
				}
			}
			function failureUserFunction(response) {
				console.log(response);
				userNotChecked = false;
			}
			}

		/**
	 	 * Given an email this function will split the email into:
	 	 * - local_part
	 	 * - domain_name
	 	 * - domain_tld
	 	 * and return the splitted email into JSON.
	 	 * @param  {[type]} email [description]
	 	 * @return {[type]}       [description]
	 	 */
		function splitEmail(email) {
			// check the email
			var atSplited = $scope.data.email.split("@");
			var local_part = atSplited[0];
			var dotSplited = atSplited[1].split(".");
			var domain_name = dotSplited[0];
			var domain_tld = dotSplited[1];

			return {
				local_part: local_part,
				domain_name: domain_name,
				domain_tld: domain_tld
			};
		}

		/**
		 * Check all the form is filled.
		 * Must be changed to more appropriate Angular way.
		 * @return {[type]} [description]
		 */
		function checkForm() {
			if ($scope.data.name == undefined ||
				$scope.data.lastName == undefined ||
				$scope.data.username == undefined ||
				$scope.data.password == undefined ||
				$scope.data.confirm == undefined ||
				$scope.data.email == undefined) {
				$("#infoH").text("Please fill all form");
				return false;
			} else {
				return true;
			}
		}
	});


	app.controller('LoginCtrl', function($scope, $state) {

		// In the custom-authentication the kolt variable
		// is first initialized at false
		// Now it is true because I am working with the adapter-based-authentication
		/*
		$scope.kolt = true;

		$scope.yas = function() {
			$state.go('app.tab.chats');  
		}

		$scope.kool = function() {
			$scope.kolt = true;
		}
		*/
	
		// starting by creating the challengeHandler
		var singleStepAuthRealmChallengeHandler = WL.Client.createChallengeHandler("SingleStepAuthRealm");

		/* The isCustomResponse function of the challenge handler 
		 * is called each time a response is received from the server. 
		 * That function is used to detect whether the response contains 
		 * data that is related to this challenge handler. The function returns true or false.
		 */

		singleStepAuthRealmChallengeHandler.isCustomResponse = function(response) {
			if (!response || !response.responseJSON || response.responseText === null) {
				return false;
			}
			if (typeof(response.responseJSON.authRequired) !== 'undefined'){
				return true;
			} else {
				return false;
			}
		};

		/* If the isCustomResponse function returns true, the 
		 * framework calls the handleChallenge function. This function 
		 * is used to perform required actions, such as to hide the 
		 * application screen or show the login screen. */
		singleStepAuthRealmChallengeHandler.handleChallenge = function(response){
			var authRequired = response.responseJSON.authRequired;

			if (authRequired == true) {

			} else if (authRequired == false){
				$state.go('app.tab.chats');

				// Workaround of the problem
				if (singleStepAuthRealmChallengeHandler.activeRequest.options.parameters.procedure != "submitAuthentication") {
                    singleStepAuthRealmChallengeHandler.submitSuccess();
                }
				//singleStepAuthRealmChallengeHandler.submitSuccess();
			}
		};


		$scope.submitIt = function () {


			console.log("Submission button cliked!");
			var username = $("#username").val();
			var password = $("#password").val();

			var authenticationConfig = {
					adapter : "SingleStepAuthAdapter",
					procedure : "submitAuthentication",
					parameters : [ username, password ]
			};

			// same as the the commented out function
			WL.Client.invokeProcedure(authenticationConfig, {});

			// singleStepAuthRealmChallengeHandler.submitAdapterAuthentication(authenticationConfig, {});
		};

	});

})();
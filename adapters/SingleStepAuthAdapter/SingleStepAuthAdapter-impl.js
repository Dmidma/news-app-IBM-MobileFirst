function onAuthRequired(headers, errorMessage) {
	errorMessage = errorMessage ? errorMessage : null;

	return {
		authRequired: true,
		errorMessage: errorMessage
	};
}

function getSecretData() {
	return {
		secretData: "Very very secret data"
	};
}

function onLogout() {
	WL.Logger.info("Logged out");
	WL.Server.setActiveUser("SingleStepAuthRealm", null);
}

function submitAuthentication(username, password) {
	/* In this sample, the credentials are validated against some 
	 * hardcoded values, but any other validation mode is valid, 
	 * for example by using SQL or web services. */

	// check the credentials in the database 
	// this part is synchronous
	// if the result isSuccessful and contains one data
	// then it's ok
	// var newsData = checkThisUser(username, password);
	// var notRegistered = (newsData.isSuccessful && newsData.resultSet.length == 1)? true : false;
	
	var notRegistered = false;
	
	// get the userName, hashed password, and salt
	var userResult = WL.Server.invokeProcedure({
		adapter : "ConnectToDatabase",
		procedure : "getSaltAndPassFromUser",
		parameters : [ username ]
	});
	
	// the result must contain only one result
	if (userResult.resultSet.length == 1) {
		
		// concatenate the new password with the user salt
		var passMe = password + userResult.resultSet[0].melh;
		
		// Hash the news generated password
		var hashNewPass = WL.Server.invokeProcedure({
			adapter: "PasswordAdapter",
			procedure: "generateHash",
			parameters: [ passMe ]
		});
		
		// compare the two passwords
		if (userResult.resultSet[0].password == hashNewPass.hash) {
			notRegistered = true;
		}
	}

	
	

	if (notRegistered) {

		/* If the validation passed successfully, the WL.Server.setActiveUser method 
		 * is called to create an authenticated session for the SingleStepAuthRealm, 
		 * with user data stored in a userIdentity object. You can add your own custom 
		 * properties to the user identity attributes. */ 
		var userIdentity = {
				userId: username,
				displayName: username, 
				attributes: {
					id: userResult.resultSet[0].id
				}
		};
		
		WL.Logger.info(WL.Server.setActiveUser("SingleStepAuthRealm", null));
		WL.Server.setActiveUser("SingleStepAuthRealm", userIdentity);

		/* An object is sent to the application, stating that the authentication 
		 * screen is no longer required. */
		return { 
			authRequired: false 
		};
	}


	/* If the credentials validation fails, an object that is built 
	 *   by the onAuthRequired function is returned to the application 
	 *   with a suitable error message. */
	return onAuthRequired(null, "Invalid login credentials");
}

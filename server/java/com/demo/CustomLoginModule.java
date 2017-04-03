package com.demo;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.json.java.JSONObject;
import com.worklight.adapters.rest.api.AdaptersAPI;
import com.worklight.adapters.rest.api.WLServerAPIProvider;
import com.worklight.server.auth.api.MissingConfigurationOptionException;
import com.worklight.server.auth.api.UserIdentity;
import com.worklight.server.auth.api.WorkLightAuthLoginModule;
import com.worklight.server.auth.api.WorkLightLoginModuleBase;

public class CustomLoginModule implements WorkLightAuthLoginModule {

	private static final long serialVersionUID = -1265193853545776791L;
	private static final Logger logger = Logger.getLogger(CustomLoginModule.class.getName());

	private static final String MAX_AUTHENTICATAION_ATTEMPTS_PROPERTY = "maxAuthenticationAttempts"; 
	private static final String VALID_USERNAME_PROPERTY = "username";
	private static final String VALID_PASSWORD_PROPERTY = "password";

	private int failedAuthenticationAttemptsCount;
	private int maxAuthenticationAttempts;

	private String validUsername;
	private String validPassword;

	private String receivedUsername;

	@Override
	public void init(Map<String, String> options) throws MissingConfigurationOptionException {
		logger.info("CustomLoginModule :: Initializing. options :: " + options.toString());

		try {
			maxAuthenticationAttempts = Integer.parseInt(options.remove(MAX_AUTHENTICATAION_ATTEMPTS_PROPERTY));
		} catch (NumberFormatException e){
			throw new MissingConfigurationOptionException(MAX_AUTHENTICATAION_ATTEMPTS_PROPERTY);
		}
		failedAuthenticationAttemptsCount = 0;


		validUsername = options.remove(VALID_USERNAME_PROPERTY);
		validPassword = options.remove(VALID_PASSWORD_PROPERTY);

		if (null == validUsername){
			throw new MissingConfigurationOptionException(VALID_USERNAME_PROPERTY);
		}
		if (null == validPassword){
			throw new MissingConfigurationOptionException(VALID_PASSWORD_PROPERTY);
		}


	}

	@Override
	public boolean login(Map<String, Object> authenticationData) {
		logger.info("CustomLoginModule :: login. authenticationData :: " + authenticationData.toString());

		receivedUsername = (String) authenticationData.get(CustomAuthenticator.USERNAME_KEY);
		String receivedPassword = (String) authenticationData.get(CustomAuthenticator.PASSWORD_KEY);

		/*
		// trying to invoke JavaScript SQL adapter into this java code server-side verification
		try {
			AdaptersAPI adaptersAPI = WLServerAPIProvider.getWLServerAPI().getAdaptersAPI();
			//Using helper method to create a request to the JS adapter
			HttpUriRequest req = adaptersAPI.createJavascriptAdapterRequest("userRegistery", "getUsers");
			//Execute the request and get the response
			HttpResponse resp = adaptersAPI.executeAdapterRequest(req);
			//Convert the response to JSON since we know that JS adapters always return JSON
			JSONObject json = adaptersAPI.getResponseAsJSON(resp);
			//Return the json response as the response of the current request that is being taking care of
			logger.info(json.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		*/
		
		
	


		



		if ((validUsername.equals(receivedUsername) && validPassword.equals(receivedPassword))){
			return true;
		} 

		failedAuthenticationAttemptsCount++;

		if (failedAuthenticationAttemptsCount >= maxAuthenticationAttempts){
			throw new RuntimeException("Maximum number of authentication attempts reached");
		} else {
			return false;
		}
	}

	@Override
	public UserIdentity createIdentity(String realm) {
		logger.info("CustomLoginModule :: createIdentity. realm :: " + realm);

		HashMap<String, Object> attributes = new HashMap<String, Object>();
		attributes.put("customAttrName", "customAttrValue");

		UserIdentity userIdentity = new UserIdentity(realm, receivedUsername, receivedUsername, null, attributes, null);
		return userIdentity;
	}

	@Override
	public void logout() {
		logger.info("CustomLoginModule :: logout");
		receivedUsername = null;
	}

	@Override
	public void abort() {
		logger.info("CustomLoginModule :: abort");
	}

	@Override
	public WorkLightLoginModuleBase clone() throws CloneNotSupportedException {
		return (WorkLightLoginModuleBase) super.clone(); 
	}

}

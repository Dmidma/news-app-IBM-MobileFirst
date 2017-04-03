/*
 *  Licensed Materials - Property of IBM
 *  5725-I43 (C) Copyright IBM Corp. 2011, 2013. All Rights Reserved.
 *  US Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */


function getLocation(lat, lon) {


	var input = {
	    method : 'get',
	    returnedContentType : 'json',
	    path : WL.Server.configuration["googleAPIPath"],
	    parameters: {
	    	'key': WL.Server.configuration["googleAPIKey"],
	    	'latlng': lat + ',' + lon
	    }
	};


	return WL.Server.invokeHttp(input);
}

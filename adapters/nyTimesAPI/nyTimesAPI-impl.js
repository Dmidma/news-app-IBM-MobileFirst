/*
 *  Licensed Materials - Property of IBM
 *  5725-I43 (C) Copyright IBM Corp. 2011, 2013. All Rights Reserved.
 *  US Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

function getNYTNews(query) {

	var input = {
	    method : 'get',
	    returnedContentType : 'json',
	    path : WL.Server.configuration["nytPath"],
	    parameters: {
	    	'api-key': WL.Server.configuration["nytKey"],
	    	'q': query,
	    	'sort': 'newest'
	    }
	};


	return WL.Server.invokeHttp(input);
}

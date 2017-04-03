/*
 *  Licensed Materials - Property of IBM
 *  5725-I43 (C) Copyright IBM Corp. 2011, 2013. All Rights Reserved.
 *  US Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */


function getGuardianNews(section, pageSize) {

	var input = {
	    method : 'get',
	    returnedContentType : 'json',
	    path : WL.Server.configuration["guardianPath"],
	    parameters: {
	    	'api-key': WL.Server.configuration["guardianKey"],
	    	'section': section,
	    	'order-by': 'newest',
	    	'page-size': pageSize,
	    	'show-fields': 'trailText%2Cthumbnail',
	    	'show-references': 'author'
	    }
	};

	return WL.Server.invokeHttp(input);
}


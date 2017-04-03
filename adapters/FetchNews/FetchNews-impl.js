

function catchThemAll() {

	// newsAPI sources and popularity (parametes of the API).
	var newsAPISources = [ {
		source : "techcrunch",
		popularity : "popular"
	}, {
		source : "independent",
		popularity : "popular"
	}, {
		source : "theverge",
		popularity : "top"
	}, {
		source : "googlenews",
		popularity : "top"
	}, {
		source : "hackernews",
		popularity : "popular"
	}, {
		source : "thenextweb",
		popularity : "popular"
	}, {
		source : "recode",
		popularity : "popular"
	} ];
	
	
	for (var j = 0, lan = newsAPISources.length; j < lan; j++) {

		// fetch news for the current source from newsAPI
		var fetched = getNewsFromnewsAPI(newsAPISources[j].popularity,
				newsAPISources[j].source).articles;
		
		// get the article source for the current source
		var article_source = getSourceId(newsAPISources[j].source).resultSet[0].id;

		// order of elements that will be pushed to array
		// title, description, image, publication_date, article_url,
		// article_source, author
		for (var i = 0, len = fetched.length; i < len; i++) {

			// initialize the arguments array
			var pushValues = [];

			// title
			pushValues.push(fetched[i].title);
			// description
			pushValues.push(fetched[i].description);
			// image
			pushValues.push((fetched[i].urlToImage) ? fetched[i].urlToImage
					: "N/A");

			// format the date
			var date = stringToDate(fetched[i].publishedAt);
			// publication_date
			pushValues.push(date);
			// arcticle_url
			pushValues.push(fetched[i].url);
			// article_source
			pushValues.push(article_source);
			// author
			pushValues.push((fetched[i].author) ? fetched[i].author : "N/A");
			
			inNewsFeed(pushValues);
		}
	}

	// the array of fetched guardian news
	var fetchedGuardian = getNewsFromTheGuardianAPI("technology", "50").response.results;

	// get theguardian news_sourcess id
	var article_source = getSourceId("theguardian").resultSet[0].id;

	for (var i = 0, len = fetchedGuardian.length; i < len; i++) {

		// initialize the arguments array
		var pushValues = [];

		// title
		pushValues.push(fetchedGuardian[i].webTitle);
		// description
		pushValues.push(fetchedGuardian[i].fields.trailText);
		// image
		pushValues
		.push((fetchedGuardian[i].fields.thumbnail) ? fetchedGuardian[i].fields.thumbnail
				: "N/A");
		// format the date
		var date = stringToDate(fetchedGuardian[i].webPublicationDate);
		// publication_date
		pushValues.push(date);
		// arcticle_url
		pushValues.push(fetchedGuardian[i].webUrl);
		// article_source
		pushValues.push(article_source);
		// author
		pushValues.push((fetchedGuardian[i].references.author) ? fetchedGuardian[i].references.author : "N/A");
		
		inNewsFeed(pushValues);
	}

	var queries = [ "technology", "google", "smartphone", "IBM", "Java",
	                "lenovo" ];

	for (var j = 0, lan = queries.length; j < lan; j++) {

		// fetching NYTimes news for the specified query
		var fetchedNYTimes = getNewsFromNYTimesAPI(queries[j]).response.docs;

		// get nytimes news_sourcess id
		var article_source = getSourceId("nytimes").resultSet[0].id;

		for (var i = 0, len = fetchedNYTimes.length; i < len; i++) {

			// initialize the arguments array
			var pushValues = [];

			// title
			pushValues.push(fetchedNYTimes[i].headline.main);
			// description
			pushValues.push(fetchedNYTimes[i].snippet);

			// Image
			if (fetchedNYTimes[i].multimedia.length > 1) {
				var prepareIt = "http://www.nytimes.com/";
				var finalURL = prepareIt + new String(fetchedNYTimes[i].multimedia[1].url).trim();
				pushValues.push(finalURL.trim());
			} else {
				pushValues.push("N/A");
			}

			// format the date
			var date = stringToDate(fetchedNYTimes[i].pub_date);
			// publication_date
			pushValues.push(date);
			// arcticle_url
			pushValues.push(fetchedNYTimes[i].web_url);
			// article_source
			pushValues.push(article_source);
			// author
			if (fetchedNYTimes[i].byline && fetchedNYTimes[i].byline.original) {
				pushValues.push(fetchedNYTimes[i].byline.original);
			} else {
				pushValues.push("N/A");
			}
			inNewsFeed(pushValues);
		}
	}

}


function getNewsFromnewsAPI(sorted, sourca) {
	return WL.Server.invokeProcedure({
		adapter : "newsAPI",
		procedure : "getNewapiNews",
		parameters : [ sorted, sourca ]
	});
}


function getNewsFromTheGuardianAPI(section, pageSize) {
	return WL.Server.invokeProcedure({
		adapter : "TheGuardianAPI",
		procedure : "getGuardianNews",
		parameters : [ section, pageSize ]
	});
}


function getNewsFromNYTimesAPI(query) {
	return WL.Server.invokeProcedure({
		adapter : "nyTimesAPI",
		procedure : "getNYTNews",
		parameters : [ query ]
	});
}



function inNewsFeed(tableau) {
	return WL.Server.invokeProcedure({
		adapter: "ConnectToDatabase",
		procedure: "inNewsFeed",
		parameters: tableau
	});
}

function getSourceId(sourca) {
	return WL.Server.invokeProcedure({
		adapter: "ConnectToDatabase",
		procedure: "getSourceId",
		parameters: [ sourca ]
	});
}

/**
 * This function will take a date formated in 'yyyy-mm-ddThh:mm:ss.milisZ' and
 * transform it into 'yyyy-mm-dd hh:mm:ss'.
 * It will return null if the input was also null.
 * @param dateTime
 *            the bad formated date.
 * @returns {String} the good formated date.
 */
function stringToDate(dateTime) {

	// return null if the input is also null
	if (dateTime == null)
		return null;

	// split the original string by 'T'
	// since 'T' is the separator between date and time
	var tmp1 = dateTime.split('T');

	// get date from the first half
	var date = tmp1[0];

	// get the second half
	// some date have .miliseconds
	// thus, I need to split by '.' first
	var tmp2 = tmp1[1].split('.')[0];

	// generally the time ends with Z, reference to zulu time
	// It must be eliminated
	var time = tmp2.split('Z')[0];

	return new String(date + ' ' + time).trim();

}
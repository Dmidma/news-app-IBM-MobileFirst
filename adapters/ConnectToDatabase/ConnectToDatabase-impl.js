/**
 * This adapter function will show the tables in the current database.
 */
var tablesStatement = WL.Server.createSQLStatement("SHOW TABLES;");
function getTables() {
	return WL.Server.invokeSQLStatement({
		preparedStatement : tablesStatement,
		parameters : []
	});
}

/**
 * This adapter function will get all news sources and their logo url path.
 */
var newsSources = WL.Server
.createSQLStatement("SELECT source, logo_img FROM news_sources;");
function getSources() {
	return WL.Server.invokeSQLStatement({
		preparedStatement : newsSources,
		parameters : []
	});
}

/**
 * This adapter will return the id of the specified news source.
 */
var sourceIdStatment = WL.Server
.createSQLStatement("SELECT id FROM news_sources WHERE source=?");
function getSourceId(source) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : sourceIdStatment,
		parameters : [ source ]
	});
}

/**
 * Must add parameter of the source and how to get the news =D
 * 
 * @returns {Array}
 */
function preparingStatement() {

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
	
	NYTLoop:
	for (var j = 0, lan = queries.length; j < lan; j++) {

		// fetching NYTimes news for the specified query
		var responseNYTimes = getNewsFromNYTimesAPI(queries[j]).response;
		
		
		// catch the error of the API key been used too much
		if (responseNYTimes == undefined || !responseNYTimes.docs) {
			WL.Logger.info(responseNYTimes);
			break NYTLoop;
		}	
		
		var fetchedNYTimes = responseNYTimes.docs; 
		
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

//make a loop and call the SQL statement each time
//not efficient but the only solution available now

/**
 * This function will add a news to the news_feed table.
 */
var insertNewsFeedStatement = WL.Server
.createSQLStatement("INSERT IGNORE INTO news_feed (title, description, image, publication_date, article_url, article_source, author) VALUES(?, ?, ?, ?, ?, ?, ?);");
function inNewsFeed(tableau) {

	WL.Server.invokeSQLStatement({
		preparedStatement : insertNewsFeedStatement,
		parameters : tableau
	});
}

var getNewsFeedStatement = WL.Server
.createSQLStatement("SELECT f.id, f.title, f.description, f.image, f.publication_date, f.article_url, s.logo_img, f.author FROM news_feed f, news_sources s WHERE f.article_source = s.id ORDER BY publication_date DESC LIMIT ?;");
function getNewsFeed(limit) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getNewsFeedStatement,
		parameters : [ limit ]
	});
}

var getOlderNewsFeedStatement = WL.Server
	.createSQLStatement("SELECT f.id, f.title, f.description, f.image, f.publication_date, f.article_url, s.logo_img, f.author FROM news_feed f, news_sources s WHERE f.article_source = s.id AND publication_date < (SELECT publication_date FROM news_feed where id=?) ORDER BY publication_date DESC LIMIT ?;");
function getOlderNewsFeed(news_id, limit) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getOlderNewsFeedStatement,
		parameters : [ news_id, limit ]
	})
}

var getSearchedNewsStatement = WL.Server
	.createSQLStatement("SELECT f.id, f.title, f.description, f.image, f.publication_date, f.article_url, s.logo_img, f.author FROM news_feed f, news_sources s WHERE f.title LIKE ? AND f.article_source = s.id ORDER BY publication_date DESC;");
function getSearchedNews(query) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getSearchedNewsStatement,
		parameters : [ query ]
	})
}





/**
 * This function will use newsAPI adapter to call the getNewsapiNews function.
 * 
 * @param sorted -
 *            how the news will be sorted (parameter of the API)
 * @param sourca -
 *            the source of the news (parameter fo the API)
 * @returns
 */
function getNewsFromnewsAPI(sorted, sourca) {
	return WL.Server.invokeProcedure({
		adapter : "newsAPI",
		procedure : "getNewapiNews",
		parameters : [ sorted, sourca ]
	});
}

/**
 * This function will use TheGuardiandAPI adapter to call the getGuardianNews
 * function.
 * 
 * @param section -
 *            Which section the news will get fetched from (parameter of the
 *            API).
 * @param pageSize -
 *            How much information will be fetched from the API (parameter of
 *            the API).
 * @returns
 */
function getNewsFromTheGuardianAPI(section, pageSize) {
	return WL.Server.invokeProcedure({
		adapter : "TheGuardianAPI",
		procedure : "getGuardianNews",
		parameters : [ section, pageSize ]
	});
}

/**
 * This function will use nyTimesAPI adapter to call the getNYTNews function.
 * 
 * @param query -
 *            the query that the api will look for (paramete of the API).
 * @returns
 */
function getNewsFromNYTimesAPI(query) {
	return WL.Server.invokeProcedure({
		adapter : "nyTimesAPI",
		procedure : "getNYTNews",
		parameters : [ query ]
	});
}

function catchThemAll() {
	return WL.Server.invokeProcedure({
		adapter : "ConnectToDatabase",
		procedure : "preparingStatement",
		parameters : []
	});
}

/**
 * get the id of the specified email domain
 */
var domainIDStatement = WL.Server
.createSQLStatement("SELECT id FROM email_domains WHERE domain_name=? AND domain_tld=?;");
function getEmailDomain(domain, tld) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : domainIDStatement,
		parameters : [ domain, tld ]
	});
}

/**
 * insert email domain name and tld into email_domains table it will ignore it
 * if there's a duplicate key
 */
var inEmailDomainsStatement = WL.Server
.createSQLStatement("INSERT IGNORE INTO email_domains (domain_name, domain_tld) VALUES (?, ?);");
function pushEmailDomain(domain, tld) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : inEmailDomainsStatement,
		parameters : [ domain, tld ]
	});
}

/**
 * insert email into the email table with local_part, domain_name, and
 * domain_tld WARNING! - It shouldn't be IGNORE
 */
var inEmailStatement1 = WL.Server
.createSQLStatement("INSERT INTO email (local_part, domain_id) VALUES (?, (SELECT id FROM email_domains WHERE domain_name=? AND domain_tld=?));");
function pushEmail1(localPart, domain_name, domain_tld) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : inEmailStatement1,
		parameters : [ localPart, domain_name, domain_tld ]
	});
}

/**
 * insert email into the email table with local_part and domain id
 */
var inEmailStatement2 = WL.Server
.createSQLStatement("INSERT INTO email (local_part, domain_id) VALUES (?, ?);");
function pushEmail2(localPart, domainId) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : inEmailStatement2,
		parameters : [ localPart, domainId ]
	});
}

/**
 * get email id by local_part, domain_name, and domain_tld
 */
var getEmailIdStatement = WL.Server
.createSQLStatement("SELECT id FROM email WHERE local_part=? AND domain_id=("
		+ "SELECT id FROM email_domains WHERE domain_name=? AND domain_tld=?);")
		function getEmailId(local_part, domain_name, domain_tld) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getEmailIdStatement,
		parameters : [ local_part, domain_name, domain_tld ]
	});
}

/**
 * get User by nickName
 */
var getUserByUserNameStatement = WL.Server
.createSQLStatement("SELECT * FROM user_registery WHERE username=?");
function getUserByUserName(username) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getUserByUserNameStatement,
		parameters : [ username ]
	});
}

/**
 * get User by email.
 */
var getUserByEmailStatement = WL.Server
.createSQLStatement("SELECT * FROM user_registery WHERE email=("
		+ "SELECT id FROM email WHERE local_part=? AND domain_id=("
		+ "SELECT id FROM email_domains WHERE domain_name=? AND domain_tld=?));");
function getUserByEmail(local_part, domain_name, domain_tld) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getUserByEmailStatement,
		parameters : [ local_part, domain_name, domain_tld ]
	});
}

/**
 * Return the id of the user logging in does exist.
 */
var getUserIDStatement = WL.Server
.createSQLStatement("SELECT id FROM user_registery WHERE username=? AND password=?");
function getUserId(username, password) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getUserIDStatement,
		parameters : [ username, password ]
	});
}

/**
 * This function will get the salt associated with the given user. 
 */
var getSaltAndPassFromUserStatement = WL.Server.createSQLStatement("SELECT id, username, password, melh FROM user_registery where username=?;");
function getSaltAndPassFromUser(username) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getSaltAndPassFromUserStatement,
		parameters : [ username ]
	}); 
}

/**
 * This function must be used only for new users. Must first check for username
 * and email address before calling this function.
 */
var registerAUserStatement = WL.Server
.createSQLStatement("INSERT INTO user_registery (name, last_name, username, password, melh, email) VALUES (?, ?, ?, ?, ?, ?);");
function registerUser(name, last_name, username, password, melh, local_part,
		domain_name, domain_tld) {

	// add email domain
	pushEmailDomain(domain_name, domain_tld);

	// add email
	pushEmail1(local_part, domain_name, domain_tld);

	var emailId = getEmailId(local_part, domain_name, domain_tld).resultSet[0].id;
	return WL.Server.invokeSQLStatement({
		preparedStatement : registerAUserStatement,
		parameters : [ name, last_name, username, password, melh, emailId ]
	});
}

/**
 * This function will get the ids of the news saved by the specified user id.
 */
var getNewsForUserStatement = WL.Server
.createSQLStatement("SELECT f.id, f.title, f.description, f.image, f.publication_date, f.article_url, s.logo_img, f.author, v.saved_date FROM news_feed f, news_sources s, saved_news v WHERE v.news_id = f.id AND f.article_source = s.id AND f.id IN (SELECT news_id FROM saved_news WHERE user_id=?);");
function getNewsForUserID(user_id) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getNewsForUserStatement,
		parameters : [ user_id ]
	});
}

/**
 * This function will save the given news for the given user.
 * It will ignore any repetition.
 */
var saveNewsForUserStatement = WL.Server.createSQLStatement("INSERT IGNORE INTO saved_news (user_id, news_id) VALUES (?, ?);");
function saveNewsForUserID(user_id, news_id) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : saveNewsForUserStatement,
		parameters : [ user_id, news_id ]
	});
}

/**
 * This function will delete the given news for the given user.
 */
var deleteNewsFromUserStatement = WL.Server.createSQLStatement("DELETE FROM saved_news WHERE user_id=? AND news_id=?;");
function deleteNewsFromUserID(user_id, news_id) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : deleteNewsFromUserStatement,
		parameters : [ user_id, news_id ]
	});
}

/**
 * This function will insert the weather for a location in a specific day.
 */
var insertWeatherStatement = WL.Server.createSQLStatement("INSERT IGNORE INTO weather (day, location, description, temperature, humidity, wind) VALUES (CURDATE() + INTERVAL ? DAY, ?, ?, ?, ?, ?);");
function insertWeather(day, location, description, temperature, humidity, wind) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : insertWeatherStatement,
		parameters : [ day, location, description, temperature, humidity, wind ]
	});
}

/**
 * This function will return the weather for a specific location, in a specific day.
 */
var fetchWeatherStatement = WL.Server.createSQLStatement("SELECT * FROM weather WHERE day=? AND location LIKE ?");
function fetchWeather(day, location) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : fetchWeatherStatement,
		parameters : [ day, location ]
	});
}

/**
 * This function will check if the database contains 16-days weather for a specified location.
 */
var weatherFor16DaysStatement = WL.Server.createSQLStatement("SELECT count(*) as found FROM weather WHERE location=? AND day=(CURDATE() + INTERVAL 15 DAY);");
function weatherFor16Days(location) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : weatherFor16DaysStatement,
		parameters : [ location ]
	});
}

/**
 * This function will fetch 16-days weather for a specified location.
 */
var fetch16DaysWeatherStatement = WL.Server.createSQLStatement("SELECT * FROM weather WHERE location=? AND day BETWEEN CURDATE() AND (CURDATE() + INTERVAL 16 DAY);");
function fetch16DaysWeather(location) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : fetch16DaysWeatherStatement,
		parameters : [ location ]
	});
}

/**
 * This function will return today weather for the specified location.
 */
var fetchTodayWeatherStatement = WL.Server.createSQLStatement("SELECT * FROM weather WHERE location=? AND day=CURDATE();");
function fetchTodayWeather(location) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : fetchTodayWeatherStatement,
		parameters : [ location ]
	});
}

var checkedWeatherStatement = WL.Server.createSQLStatement("UPDATE weather SET description=?, temperature=?, humidity=?, wind=?, checked=1 WHERE id=?;");
function checkedWeather(description, temperature, humidity, wind, id) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : checkedWeatherStatement,
		parameters : [ description, temperature, humidity, wind, id ]
	});
}



var insertLocationStatement = WL.Server.createSQLStatement("INSERT IGNORE INTO location (country, level1, level2, latitude, longitude) VALUES (?, ?, ?, ?, ?);");
function insertLocation(country, level1, level2, latitude, longitude) {
	return WL.Server.invokeSQLStatement({
		preparedStatement: insertLocationStatement,
		parameters: [country, level1, level2, latitude, longitude]
	});
}

var getLocationLatLonStatement = WL.Server.createSQLStatement("SELECT id, country, level1, level2 FROM location WHERE (latitude BETWEEN ? AND ?) AND (longitude BETWEEN ? AND ?);");
function getLocationLatLon(
		latitudeMin, 
		latitudeMax, 
		longitudeMin,
		longitudeMax) {
	return WL.Server.invokeSQLStatement({
		preparedStatement: getLocationLatLonStatement,
		parameters: [latitudeMin, latitudeMax, longitudeMin, longitudeMax]
	});
}


var getLocationIdStatement = WL.Server.createSQLStatement("SELECT id FROM location WHERE country=? AND level1=? AND level2=?;");
function getLocationId(country, level1, level2) {
	return WL.Server.invokeSQLStatement({
		preparedStatement: getLocationIdStatement,
		parameters: [country, level1, level2]
	});
}


/**
 * TODO: Make sure to check user email and user name by count rather than the
 * other way.
 */
var tryMeStatement = WL.Server
.createSQLStatement("SELECT COUNT(id) as nbr FROM news_feed;");
function tryMe() {
	return WL.Server.invokeSQLStatement({
		preparedStatement : tryMeStatement,
		parameters : []
	});
}

/**
 * This function will return the url of the source logo.
 * Not needed since I have included the source and the logo into getNewsFeed.
 */
var getSourceImageStatement = WL.Server.createSQLStatement("SELECT logo_img FROM news_sources WHERE id = ?;");
function getSourceImage(id) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getSourceImageStatement,
		parameters : [ id ]
	});
}

var getAllSourcesStatement = WL.Server.createSQLStatement("SELECT source, logo_img FROM news_sources;");
function getAllSources() {
	return WL.Server.invokeSQLStatement({
		preparedStatement : getAllSourcesStatement,
		parameters : []
	});
}



var testStatement = WL.Server.createSQLStatement("INSERT INTO test (lat, lon) VALUES(?, ?);");
function insertTest(lat, lon) {
	return WL.Server.invokeSQLStatement({
		preparedStatement : testStatement,
		parameters : [lat, lon]
	});
}

/**
 * This function will return the current weather of the city given by its ID.
 * @param id of the city.
 * @returns weather of that city.
 */
function getCurrentWeatherID(id) {


	var input = {
			method : 'get',
			returnedContentType : 'json',
			path : WL.Server.configuration["currentWeatherPath"],
			parameters: {
				'APPID': WL.Server.configuration["openWeatherKey"],
				'id': id,
			}
	};

	return WL.Server.invokeHttp(input);
}


/**
 * This function will return the weather of 16 days of the city given by its ID.
 * @param id of the city.
 * @returns 16 days weather of that city.
 */
function getDailyWeatherID(id) {
	var input = {
			method : 'get',
			returnedContentType : 'json',
			path : WL.Server.configuration["dailyForecastPath"],
			parameters: {
				'APPID': WL.Server.configuration["openWeatherKey"],
				'id': id,
				'cnt': "16",
				
			}
	};
	
	return WL.Server.invokeHttp(input);
}



/**
 * This function will retun the current weather of a given geo-coordinates place.
 * @param lat latitude of the place.
 * @param lon longitude of the place.
 * @returns obvious.
 */


function getCurrentWeatherGeo(lat, lon) {


	var input = {
			method : 'get',
			returnedContentType : 'json',
			path : WL.Server.configuration["currentWeatherPath"],
			parameters: {
				'APPID': WL.Server.configuration["openWeatherKey"],
				'lat': lat,
				'lon': lon
			}
	};

	return WL.Server.invokeHttp(input);
}




/**
 * This function will return the weather of 16 days of a given geo-coordinates place.
 * @param lat latitude of the palce.
 * @param lon longitude of the place.
 * @returns obvious.
 */
function getDailyWeatherGeo(lat, lon) {
	var input = {
			method : 'get',
			returnedContentType : 'json',
			path : WL.Server.configuration["dailyForecastPath"],
			parameters: {
				'APPID': WL.Server.configuration["openWeatherKey"],
				'lat': lat,
				'lon': lon,
				'cnt': "16",
				
			}
	};
	
	return WL.Server.invokeHttp(input);
}



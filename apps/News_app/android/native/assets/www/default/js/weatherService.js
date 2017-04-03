
/* JavaScript content from js/weatherService.js in folder common */
(function() {
	var service = angular.module('starter.weatherservice', []);

	service.factory('WeatherService', function() {

		// map that will contain weather descriptions and their correspondant icons
		var descriptionMap = {};

		// fill that map
		(function setTheDescriptionMap() {
			var descResponds = [
	            {
	              desc: "clear sky",
	              icon: "ion-ios-sunny-outline"
	            },
	            {
	              desc: "few clouds",
	              icon: "ion-ios-partlysunny-outline"
	            },
	            {
	              desc: "scattered clouds",
	              icon: "ion-ios-cloudy-outline"
	            },
	            {
	              desc: "broken clouds",
	              icon: "ion-ios-cloudy"
	            },
	            {
	              desc: "shower rain",
	              icon: "ion-ios-rainy"
	            },
	            {
	              desc: "rain",
	              icon: "ion-ios-rainy-outline"
	            },
	            {
	              desc: "light rain",
	              icon: "ion-ios-rainy-outline"
	            },
	            {
	              desc: "moderate rain",
	              icon: "ion-ios-rainy-outline"
	            },
	            {
	              desc: "thunderstorm",
	              icon: "ion-ios-thunderstorm-outline"
	            },
	            {
	              desc: "snow",
	              icon: "ion-ios-snowy"
	            },
	            { 
	              // TODO: change the icon for the mist description
	              desc: "mist",
	              icon: "ion-load-a"
	            }
        	];
        	// fill the map with
        	// keys as descriptions
        	// values as icons
        	for (var i = 0, len = descResponds.length; i < len; i++ ) {
        		descriptionMap[descResponds[i].desc] = descResponds[i].icon;
			}
		})();


		
		
		var weatherObjects = {};

		return {
			getIconForDescription: function(description) {
				return descriptionMap[description];
			},
			getAllWeather: function() {
				return weatherObjects;
			},
			addWeather: function(key, weather) {
				weatherObjects[key] = weather;
			}, 
			getWeather: function(key) {
				return weatherObjects[key];
			}
		};
	});
})();
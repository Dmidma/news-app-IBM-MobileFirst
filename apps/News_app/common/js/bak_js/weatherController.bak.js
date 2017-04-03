(function() {

	var app = angular.module('weather.controller', []);

	app.controller('DashCtrl', function($scope, $http) {

		$scope.readyLoc = false;

		var options = {
			enableHighAccuracy: true,
			maximumAge: 3600000
		};

		// get go coordinates
		var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

		function onSuccess(position) {

			// succeeded
			$scope.readyLoc = true;

			$scope.lat = position.coords.latitude;
			$scope.lon = position.coords.longitude;
			$scope.accuracy = position.coords.accuracy;

			// get in world location with Google API
			var gaurl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
      		gaurl += $scope.lat;
      		gaurl += ',';
      		gaurl += $scope.lon;
      		gaurl += "&key=AIzaSyCuI3k-i1um2MK89z-gl9fgbvFga87Kixk";
      		
      		// http request config for the Google API 
      		var config = {
      			method: 'GET',
      			url: gaurl
    		};

    		$http(config).then(function (response) {
    			var addCompo = response.data.results[0].address_components;
    			
    			// looking for the names of country, administrative_area_level_1, and administrative_area_level_2
          		// in the received JSON file
          		for (i = 0; i < addCompo.length; i++) {

            		// get current object
            		var currObj = addCompo[i];

            		// get the types array of the current object
            		var typ = currObj.types;
            		for (j = 0; j < typ.length; j++) {
              			if (typ[j] === "country") {
                			$scope.country = currObj.long_name;
              			}
              			else if (typ[j] === "administrative_area_level_1") {
                			$scope.level1 = currObj.short_name;
              			}
              			else if (typ[j] === "administrative_area_level_2") {
                			$scope.level2 = currObj.short_name;
              			}
            		}
          		}
          
          		// at this point we will hopefully have, contry, admin_area_level1, and admin_area_level2


          		// for now I will test if the administrative_area_level_1 is equal to Gouvernorat de Sousse
          		// if so we are going to give it its correspondant ID else the ID of the country TN	
          		// May also have a data structre that will contain several visited places
          		// before start looking in the file
          		if ($scope.level1 == "Gouvernorat de Sousse")
          			$scope.placeID = 2464912;
          		else
          			$scope.placeID = 2464461;



          		// @ this point we will hopefully have the name of the location and ID of location
			

				// url of the weather API with the location ID
				var weathurl = 'http://api.openweathermap.org/data/2.5/weather?id=';
      			weathurl += $scope.placeID;
      			weathurl += "&APPID=860ac8b75699f6c8a4bd406622ea7c31";

      			var config = {
      				method: 'GET',
      				url: weathurl
    			};

    			$http(config).then(function (response) {
    				$scope.weatherDesc = response.data.weather[0].description;
    				// humidity in %
    				$scope.humidity = response.data.main.humidity;
    				// temperature in Kelvin
    				$scope.temp = response.data.main.temp;
    				// convert temp to Celcius
    				$scope.temp -= 273.15;
    				// only 2 digits after .
    				$scope.temp = Math.round($scope.temp * 100) / 100;
    				// wind in mps
    				$scope.wind = response.data.wind.speed;
    				// Possible weather description responses:
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
    				  		desc: "thunderstorm",
    				  		icon: "ion-ios-thunderstorm-outline"
    				  	},
    				  	{
    				  		desc: "snow",
    				  		icon: "ion-ios-snowy"
    				  	},
    				  	{	
    				  		// change the icon for the mist description
    				  		desc: "mist",
    				  		icon: "ion-load-a"
    				  	}
    				];

    				for (i = 0; i < descResponds.length; i++) {
    					if (descResponds[i].desc == $scope.weatherDesc) {
    						$('#iconI').addClass(descResponds[i].icon);
    						break;
    					}
    				}
    			}, function (response) {
    				// add an execption that will handle the fail
    				// eg displaying "Look outside"
    			});

    		}, function (response) {
    			// add an execption that will handle the fail
    			// eg displaying "Somewhere in Earth"
    		});
		};

		function onError(error) {
			alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		};



	});




	app.directive('weatherSection', function() {
		return {
			restrict: 'E',
			templateUrl: 'templates/weather-section.html'
		};
	});

	app.directive('newsSection', function() {
		return {
			restrict: 'E',
			templateUrl: 'templates/news-sections.html'			
		};
	});

})();
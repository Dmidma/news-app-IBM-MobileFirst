(function() {

    var app = angular.module('weather.controller', []);

	app.controller('DashCtrl', function($scope, $http) {

        // check what is global scope variable for!!
		$scope.readyLoc = false;

        // options for navigator.gelocation
		var coordsOptions = {
			enableHighAccuracy: true,
			maximumAge: 3600000
		};

        // success function of navigator.geolocation
        function gotCoords(position) {

            $scope.lat = position.coords.latitude;
            $scope.lon = position.coords.longitude;
            $scope.accuracy = position.coords.accuracy;


            // Google api request config
            var googleAPIConfig = {
                adapter: 'GoogleLocation',
                procedure: 'getLocation',
                parameters: [$scope.lat, $scope.lon],
            };

            // invoke googleAPI adapter function
            WL.Client.invokeProcedure(googleAPIConfig,{ 
                onSuccess: gotGoogleAPILocation, 
                onFailure: gotNotGoogleAPILocation}
            );
        };

        // fail function of navigator.geolocation
        function gotNotCoords(error) {
            alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
        };

		// get geolocation coordinates
		var watchID = navigator.geolocation.getCurrentPosition(gotCoords, gotNotCoords, coordsOptions);


        // success function of Google API request
        function gotGoogleAPILocation(response) {

        
          var addCompo = response.responseJSON.results[0].address_components;
          
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
                $scope.placeID = '2464912';
              else
                $scope.placeID = '2464461';


              // @ this point we will hopefully have the name of the location and ID of location
        

              // openWeather api config
              var openWeatherConfig = {
                adapter: 'OpenWeatherAPI',
                procedure: 'getWeather',
                parameters: [$scope.placeID],
              };

              WL.Client.invokeProcedure(openWeatherConfig,{ 
                onSuccess: gotWeather, 
                onFailure: gotNotWeather}
              );
        };

        // fail function of Google API request
        function gotNotGoogleAPILocation(response) {
            console.log("Google API Adapter Failed to do its damn job !");
            console.log(response);
        };


        // success function of openWeather request
        function gotWeather(response) {
            $scope.weatherDesc = response.responseJSON.weather[0].description;
            // humidity in %
            $scope.humidity = response.responseJSON.main.humidity;
            // temperature in Kelvin
            $scope.temp = response.responseJSON.main.temp;
            // convert temp to Celcius
            $scope.temp -= 273.15;
            // only 2 digits after .
            $scope.temp = Math.round($scope.temp * 100) / 100;
            // wind in mps
            $scope.wind = response.responseJSON.wind.speed;
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

            // wrap the readyLoc around this function just to let him know
            // that a change has been made
            $scope.$apply(function(){
                // succeeded
                $scope.readyLoc = true;
            });
        };

        // fail function of openWeather request
        function gotNotWeather(response) {
            console.log(response);
        };
	});



    // directive for the weather section
	app.directive('weatherSection', function() {
		return {
			restrict: 'E',
			templateUrl: 'templates/weather-section.html'
		};
	});

    // directive for the news section
	app.directive('newsSection', function() {
		return {
			restrict: 'E',
			templateUrl: 'templates/news-sections.html'			
		};
	});

})();

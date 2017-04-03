
/* JavaScript content from js/weatherController.js in folder common */
(function() {
	
	var app = angular.module('weather.controller', []);

	app.controller('DashCtrl', function($scope, $http, $ionicLoading, WeatherService) {
		
		/**
		 * This function will be called to return the geo-location of the user.
		 * @return {[type]} [description]
		 */
		function getGeolocation(callback) {
			// options for navigator.geolocation
			var coordsOptions = {
				enableHighAccuracy: true,
				maximumAge: 3600000
			};

			// success callback of navigator.geolocation
			function gotCoords(position) {

				// get the geo-coordinates
				$scope.lat = position.coords.latitude;
	            $scope.lon = position.coords.longitude;
	            
	            // keep only three digits in the decimal for latitude and longitude
	            var roundedLat = formattedRound($scope.lat, 3);
	            var roundedLon = formattedRound($scope.lon, 3);

	            // check the database if the location is already stored
	            getLocationLatLon(roundedLat, roundedLon);    
			}

			// failure callback of navigator.geolocation
			function gotNotCoords(position) {
				console.log("Could not determine the geo-location of the user.");
				console.log(position);
			}

			// get geolocation coordinates
			navigator.geolocation.getCurrentPosition(gotCoords, gotNotCoords, coordsOptions);
		}

		function formattedRound(value, decimalDegits) {
			var howMuch = Math.pow(10, decimalDegits);
			return Math.round(value * howMuch) / howMuch;
		}

		/**
		 * This function will return the name of the place using Google API based on
		 * latitude and longitude.
		 * After this function will be called, we will have a JSON in $scope.place 
		 * that hopefully contains:
		 * county
		 * administrative area level 1
		 * administrative area level 2
		 * @param  {[type]} latitude  [description]
		 * @param  {[type]} longitude [description]
		 * @return {[type]}           [description]
		 */
		function getLocationName(latitude, longitude) {


			// Google api request config
            var googleAPIConfig = {
                adapter: 'GoogleLocation',
                procedure: 'getLocation',
                parameters: [latitude, longitude],
            };

            // invoke googleAPI adapter function
            WL.Client.invokeProcedure(googleAPIConfig,{ 
                onSuccess: gotGoogleAPILocation, 
                onFailure: gotNotGoogleAPILocation}
            );

            // success callback of Google location API
            function gotGoogleAPILocation(response) {

            	var addCompo = response.responseJSON.results[0].address_components;


          		// looking for the names of country, administrative_area_level_1, and administrative_area_level_2
              	// in the received JSON and then storing them into the places object.
              	for (i = 0; i < addCompo.length; i++) {

                	// get current object
                	var currObj = addCompo[i];

                	// get the types array of the current object
                	var typ = currObj.types;
                	
                	for (j = 0; j < typ.length; j++) {
                    	if (typ[j] === "country") {
                    		$scope.places.country = currObj.long_name;
                    	}
                    	else if (typ[j] === "administrative_area_level_1") {
                      		$scope.places.level1 = currObj.short_name;
                    	}
                    	else if (typ[j] === "administrative_area_level_2") {
                    		$scope.places.level2 = currObj.short_name;
                    	}
                	}
              	}

              	// insert the new places into location table
              	insertLocation(
              		$scope.places.country? $scope.places.country : "N/A", 
              		$scope.places.level1? $scope.places.level1 : "N/A",
              		$scope.places.level2? $scope.places.level2 : "N/A",
              		$scope.lat, 
              		$scope.lon);

              	
            }

            // failure callback of Google location API
            function gotNotGoogleAPILocation(response) {
            	console.log("Google API Adapter Failed to do its damn job !");
            	console.log(response);
            }
		}

		function getWeather(latitude, longitude, tableId, callback) {
			// openWeather api config
			var openWeatherConfig = {
				adapter: 'OpenWeatherAPI',
				procedure: 'getCurrentWeatherGeo',
				parameters: [latitude, longitude],
			};

			WL.Client.invokeProcedure(openWeatherConfig,{ 
				onSuccess: gotWeatherGeo, 
				onFailure: gotNotWeatherGeo
			});


			// success callback of openweather API
			function gotWeatherGeo(response) {

				var obj = response.responseJSON;
				
				var weatherDesc = "N/A";
				
				if (obj.weather) {
					// description
					weatherDesc = obj.weather[0].description;	
				}
				
	            // humidity in %
	            var humidity = obj.main.humidity;
	            // temperature in Kelvin
	            var temp = obj.main.temp;
	            // convert temp to Celcius
	            temp -= 273.15;
	            // only 2 digits after .
	            temp = formattedRound(temp, 2);
	            // wind in mps
	            var wind = obj.wind.speed;


	            callback(weatherDesc, temp, humidity, wind);

	            // update today weather of a specific place
	            updateWeather(weatherDesc, temp, humidity, wind, tableId);


			}

			// failure callback of openweather API
			function gotNotWeatherGeo(response) {
				console.log("Something Went fully wrong with openweather API");
				console.log(response);
			}
		}
	
		function getDailyWeather(latitude, longitude) {
			// openWeather api config
			var openWeatherConfig = {
				adapter: 'OpenWeatherAPI',
				procedure: 'getDailyWeatherGeo',
				parameters: [latitude, longitude],
			};

			WL.Client.invokeProcedure(openWeatherConfig,{ 
				onSuccess: gotDailyWeatherGeo, 
				onFailure: gotNotDailyWeatherGeo
			});


			// success callback of openweather API
			function gotDailyWeatherGeo(response) {

				var dailyWeather = response.responseJSON.list
				for (var i = 0, leng = dailyWeather.length; i < leng; i++) {
					

					var currWeather = dailyWeather[i];
		            // temperature in Kelvin
		            var temp = currWeather.temp.day;
		            // convert temp to Celcius
		            temp -= 273.15;
		            // only 2 digits after .
		            temp = formattedRound(temp, 2);


		           	insertWeatherBase(
		           		i,
		           		$scope.places.id, 
		           		currWeather.weather[0].description,
		           		temp,
		           		currWeather.humidity,
		           		currWeather.speed);
				}
			}

			// failure callback of openweather API
			function gotNotDailyWeatherGeo(response) {
				console.log("Something Went fully wrong with openweather API");
				console.log(response);
			}
		}

		function fetchWeatherBase(day, location) {
			// weather table fetching config
			var fetchWeatherConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'fetchWeather',
				parameters: [day, location],
			};

			WL.Client.invokeProcedure(fetchWeatherConfig,{ 
				onSuccess: gotWeatherData, 
				onFailure: gotNotWeatherData
			});


			// success callback of fetching weather table
			function gotWeatherData(response) {
				console.log(response);
			}

			// failure callback of fetching weather table
			function gotNotWeatherData(response) {
				console.log("Something Went fully wrong with fetching data from weather table");
				console.log(response);
			}
		}

		function insertLocation(country, level1, level2, latitude, longitude) {
			// weather table fetching config
			var insertLocationConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'insertLocation',
				parameters: [country, level1, level2, latitude, longitude],
			};

			WL.Client.invokeProcedure(insertLocationConfig,{ 
				onSuccess: insertedLocation, 
				onFailure: insertedNotLocation
			});


			// success callback of inserting location
			function insertedLocation(response) {

				// after insertion call a function to get the id of the added location
              	// and store it in the $scope.places JSON
              	getIdOfLocation(
              		$scope.places.country, 
              		$scope.places.level1, 
              		$scope.places.level2);
			}

			// failure callback of inserting location
			function insertedNotLocation(response) {
				console.log("Something Went fully wrong with getting id of the inserted location.");
				console.log(response);
			}
		}

		function getLocationLatLon(latitude, longitude) {
			// weather table fetching config
			var getLocationLatLonConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'getLocationLatLon',
				parameters: [
					latitude - 0.002, 
					latitude + 0.002, 
					longitude - 0.002,
					longitude + 0.002],
			};

			WL.Client.invokeProcedure(getLocationLatLonConfig, { 
				onSuccess: gotLocationLatLon, 
				onFailure: gotNotLocationLatLon
			});


			// success callback of inserting location
			function gotLocationLatLon(response) {

				// the location will be in this given array
				var locations = response.responseJSON.resultSet;

				// initiliaze $scope.places JSON
				// which will eventually contain 3 elements: country, level1, level2
				$scope.places = {};

				// call google api if no location exist in the database
				if (locations.length == 0) {
					
					// Call google Location API 
	            	getLocationName($scope.lat, $scope.lon);
				} else if (locations.length == 1) {
					// get the location
					var location = locations[0];

					// fill the places object with the right values
					$scope.places.country = location.country;
					$scope.places.level1 = location.level1;
					$scope.places.level2 = location.level2;
					$scope.places.id = location.id;

					$scope.doneLocation.condition = true;
				} else {
					console.log("Something wrong boy");
				}
			}

			// failure callback of inserting location
			function gotNotLocationLatLon(response) {
				console.log("Something Went fully wrong with getting data from location table");
				console.log(response);
			}
		}

		function insertWeatherBase(day, location, description, temperature, humidity, wind) {
			// weather table inserting config
			var insertWeatherConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'insertWeather',
				parameters: [day, location, description, temperature, humidity, wind],
			};	

			WL.Client.invokeProcedure(insertWeatherConfig,{ 
				onSuccess: insertedWeather, 
				onFailure: insertedNotWeather
			});


			// success callback of fetching weather table
			function insertedWeather(response) {
				//console.log(response);
			}

			// failure callback of fetching weather table
			function insertedNotWeather(response) {
				console.log("Something Went fully wrong with fetching data from weather table");
				console.log(response);
			}
		}

		function getIdOfLocation(country, level1, level2) {
			// weather table fetching config
			var getIdOfLocationConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'getLocationId',
				parameters: [country, level1, level2],
			};

			WL.Client.invokeProcedure(getIdOfLocationConfig, { 
				onSuccess: gotLocationId, 
				onFailure: gotNotLocationId
			});

			// success callback of getLocationId
			function gotLocationId(response) {
				
				// get the array of results from the response
				// the array will contain only one object
				$scope.places.id = response.responseJSON.resultSet[0].id;

				// after inserting the new location, it's a good idea to fetch the 16-days weather
              	getDailyWeather(new String($scope.lat), new String($scope.lon));

              	$scope.doneLocation.condition = true;
			}

			// failure callback of getLocationId
			function gotNotLocationId(response) {
				console.log("Something went wrong with fetching id of a location.")
				console.log(response);
			}
		}
		
		function getTodayWeatherForLocation(location) {
			// fetching today weather for specified location config
			var insertWeatherConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'fetchTodayWeather',
				parameters: [location],
			};	

			WL.Client.invokeProcedure(insertWeatherConfig,{ 
				onSuccess: fetchedTodayWeather, 
				onFailure: fetchedNotTodayWeather
			});

			// success callback of fetchTodayWeather
			function fetchedTodayWeather(response) {
				// get the result array
				var results = response.responseJSON.resultSet;

				$scope.temp = results[0].temperature;
				$scope.humidity = results[0].humidity;
				$scope.wind = results[0].wind;
				$scope.description = results[0].description;

				// fetch the weather for 16 day if no result was found
				if (results.length == 0) {
					getDailyWeather(new String($scope.lat), new String($scope.lon));
				} else if (results.length == 1) {
					// test if the current weather is checked
					if (!results[0].checked) {
						// check the current weather
						// getWeather(new String($scope.lat), new String($scope.lon), results[0].id);
					} else {
						// if it is already checked
						// print it to the user
						// Possible weather description responses:
            			
            			$('#iconI').addClass(WeatherService.getIconForDescription($scope.description));
		

            
					}
				} else {
					console.log("Result is more than 1 ?!");
				}
			}

			// failure callback of fetchTodayWeather
			function fetchedNotTodayWeather(response) {
				console.log("Something went wrong when fetching today weather for specified location.");
				console.log(response);
			}
		}

		function updateWeather(description, temperature, humidity, wind, id) {
			// update weather config
			var updateWeatherConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'checkedWeather',
				parameters: [description, temperature, humidity, wind, id],
			};	

			WL.Client.invokeProcedure(updateWeatherConfig, { 
				onSuccess: updatedWeather, 
				onFailure: updatedNotWeather
			});

			// success callback of checkedWeather
			function updatedWeather(response) {
				// console.log(response);
				// TODO: declare global variables to store the changed results
			}

			// failure callback of checkedWeather
			function updatedNotWeather(response) {
				console.log("Something went wrong while updating the weather.");
				console.log(response);
			}
		}

		function check16daysWeather(location) {
			// checking 16-days weather for specified location config
			var check16daysConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'weatherFor16Days',
				parameters: [location],
			};	

			WL.Client.invokeProcedure(check16daysConfig, { 
				onSuccess: checked16days, 
				onFailure: checkedNot16days
			});

			// success callback of weatherFor16Days
			function checked16days(response) {

				var found = response.responseJSON.resultSet[0].found;

				// if the database contains weather for today and the next 15-days
				if (found == 1) {
		
				} else if (found == 0) {
					// get daily weather and save them in the database
					getDailyWeather(new String($scope.lat), new String($scope.lon));
				}

				fetch16daysWeather($scope.places.id);
			}

			// failure callback of weatherFor16Days
			function checkedNot16days(response) {
				console.log("Something went wrong when checking for 16 days weather.");
				console.log(response);
			}
		}

		function fetch16daysWeather(location) {
			// fetching 16-days weather for specified location config
			var fetch16daysConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'fetch16DaysWeather',
				parameters: [location],
			};	

			WL.Client.invokeProcedure(fetch16daysConfig, { 
				onSuccess: fetched16days, 
				onFailure: fetchedNot16days
			});

			

			// success callback of fetch16DaysWeather
			function fetched16days(response) {
				
				// get the result array
				var weatherArray = response.responseJSON.resultSet;

				// loop over the array and add them into the weatherService as objects
				for (var i = 0, len = weatherArray.length; i < len; i++) {

					// get the day of the current weather
					var currDate = new Date(weatherArray[i].day);

					// create the key of the weather object from the date
					// day-month-year
					var currKey = createKeyFromDate(currDate);
					
					// add the object in the weather service
					WeatherService.addWeather(currKey, weatherArray[i]);
				}

				// check if today weather is checked with openweather api
				var todayKey = createKeyFromDate(new Date());


				$scope.todayWeather = {condition: true};

				// if today weather is not checked
				// use openweather api to check it 
				// and store it the database
				if (!WeatherService.getWeather(todayKey).checked) {
					$scope.todayWeather.condition = false;
					// fetch todayWeather for this location and update it in the table
					getWeather($scope.latitude, 
						$scope.longitude, 
						WeatherService.getWeather(todayKey).id, 
						function(weatherDesc, temp, humidity, wind) {
							WeatherService.getWeather(todayKey).checked = true;
							WeatherService.getWeather(todayKey).description = weatherDesc;
							WeatherService.getWeather(todayKey).temperature = temp;
							WeatherService.getWeather(todayKey).humidity = humidity;
							WeatherService.getWeather(todayKey).wind = wind;

							$scope.todayWeather.condition = true;
						});
				}


				conditionalTimeout($scope.todayWeather, finalForm, 1000);
			}

			// failure callback of fetch16DaysWeather
			function fetchedNot16days(response) {
				console.log("Something went wrong while fetching 16-days weather.");
				console.log(response);
			}
		}


		/**
		 * Helper function that will create a custom date key from a date object.
		 * The key will be "day-month-year".
		 * @param  {Date} date date object.
		 * @return {String}      custom string key.
		 */
		function createKeyFromDate(date) {
			return new String(date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
		}

		function finalForm() {

			var todayKey = createKeyFromDate(new Date());

			$scope.temp = WeatherService.getWeather(todayKey).temperature;
			$scope.humidity = WeatherService.getWeather(todayKey).humidity;
			$scope.wind = WeatherService.getWeather(todayKey).wind;
			$scope.description = WeatherService.getWeather(todayKey).description;

			
			$('#iconI').addClass(WeatherService.getIconForDescription($scope.description));


			// wrap the readyLoc around this function just to let him know
   			// that a change has been made
    		$scope.$apply(function(){
        		// succeeded
        		$scope.readyLoc = true;


        		// fill the table of 15-days weather
        		fill15DaysTable();
        		/*
        		$ionicLoading.hide().then(function(){
          			console.log("The loading indicator is now hidden");
        		});
        		*/
    		});
		}

		function fill15DaysTable() {

			var days = ['Sun','Mon','Tues','Wednes','Thurs','Fri','Satur'];
			var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			

			var currDate = new Date();
			for (var i = 0; i < 15; i += 3) {
				// WeatherService F:99
				var row = $(document.createElement('tr'));

				for (var j = 0; j < 3; j++) {
					var column = $(document.createElement('td'));

					
					column.addClass("sectioni");
					column.addClass("colim");

					if (j != 2)
						column.addClass("bordoura");

					currDate.setDate(currDate.getDate() + 1);

					var currWeather = WeatherService.getWeather(createKeyFromDate(currDate));

					var icon = $(document.createElement('i'));
					icon.addClass("icon");
					icon.addClass("biggie");
					icon.addClass(WeatherService.getIconForDescription(currWeather.description));
					column.append(icon);


					var descri = $(document.createElement('p'));
					descri.append(currWeather.description);
					
					descri.addClass("descri");

					column.append($(document.createElement('br')));
					column.append(descri);


					var tempri = $(document.createElement('p'));
					tempri.append(currWeather.temperature + "°");

					var thermo = $(document.createElement('i'));
					thermo.addClass("ion-thermometer");

					tempri.append(thermo);


					column.append(tempri);

					

					var dam = $(document.createElement('p'));
					dam.append(days[currDate.getDay()] + ". " + currDate.getDate());
					dam.addClass("daym")
					column.append(dam);

					row.append(column);
				}

				$("#weather_table").append(row);
			}
		}

		function checkWeather() {
			check16daysWeather($scope.places.id);
		}

		/*
		$ionicLoading.show({
        	template: 'Loading...'
      	}).then(function(){
        	console.log("The loading indicator is now displayed");
      	});
		*/

      	// the object that will contain the condition that will indicate the end 
      	// of fetching location part
      	$scope.doneLocation = {condition: false};
      	
      	// location part
		getGeolocation();

		// weather part
		conditionalTimeout($scope.doneLocation, checkWeather, 2000);

		
		/**
		 * This function will act like `setTimeout` but that will only stop if the condition is true.
		 * Also the check of the condition will be at maximum every 1 second, since the function
		 * will divide the specified timeout by two every time, but not lower than 1 second.
		 * The condition must be JavaScript object.
		 * @param  {Object}   condition The object that will contain .condition which is boolean value.
		 * @param  {Function} callback  The function that will be called when the .condition is `true`.
		 * @param  {int}   timeout   The time of timeout.
		 * @return {[type]}             [description]
		 */
		function conditionalTimeout(condition, callback, timeout) {
			setTimeout(function() {
				if (condition.condition) {
					callback();
				} else {
					if (timeout > 1000) {
						timeout = timeout / 2;
						if (timeout < 1000) {
							timeout = 1000;
						}
					}
					conditionalTimeout(condition, callback, timeout);
				}
			}, timeout);		
		}
	});

	
	


	// directive for the weather section
	app.directive('weatherSection', function() {
		return {
			restrict: 'E',
			templateUrl: 'templates/weather-section.html'
		};
	});

	// directive for the news function
	app.directive('newsSection', function() {
		return {
			restrict: 'E',
			templateUrl: 'templates/news-sections.html'			
		};
	});
})();
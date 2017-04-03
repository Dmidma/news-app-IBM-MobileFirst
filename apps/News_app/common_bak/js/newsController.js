(function() {

	var app = angular.module('news.controller', []);

	app.controller("newsController", function($scope, NewsService) {

		this.hello = "NEWS:";


		// News object fields
		// main - title
		// snippet - description
		// medi - image "N/A" or not
		// multimedia - url to image
		// sourceImg - thumbnail of the news source
		// web_url - article_url
		// pub_date - publication_date (YOUPI)
		// newsId - getId(); *****
		// add author !!!!!


		// invoke getNewsFeed from ConnectToDatabase adapter
		var connectDatabaseConfig = {
			adapter: 'ConnectToDatabase',
			procedure: 'getNewsFeed',
			parameters: [ 50 ]
		};


		WL.Client.invokeProcedure(connectDatabaseConfig, {
			onSuccess: dataConnectionFunction,
			onFailure: notDataConnectionFunction
		});

		function dataConnectionFunction(response) {

			// get the array that contains the news
			var newsArray = response.responseJSON.resultSet;
			for (var i = 0, len = newsArray.length; i < len; i++) {
				
				// initialize object that will be saved in service
				var createObj = {};

				// title
				createObj.main = newsArray[i].title;
				// description
				createObj.snippet = newsArray[i].description;
				// image
				if (newsArray[i].image == "N/A") {
					createObj.medi = false;
				} else {
					createObj.medi = true;
					createObj.multimedia = newsArray[i].image;
				}
				// author
				if (newsArray[i].author != "N/A") {
					createObj.authi = true;
					createObj.author = newsArray[i].author;
				} else {
					createObj.authi = false;
				}
				// source logo
				createObj.sourceImg = newsArray[i].logo_img;
				// article_url
				createObj.web_url = newsArray[i].article_url;
				// pub_date
				createObj.pub_date = newsArray[i].publication_date;
				// local ID
				createObj.newsId = getId();

				// save it 
				saveNews(createObj);
			}
		}

		function notDataConnectionFunction(response) {
			console.log(response);
		}

		/*
			This function will return the id of the current news.
			Basically the id of the news is the length of the news array.
		 */
		function getId() {
			return NewsService.leng();
		}

		/*
			This function will add created news to the array of the service.
		 */
		function saveNews(news) {
			NewsService.add(news);
		};

		/*
		  	This function will be used in the news-section.html so we can use the ng-repeat 
			to loop over all the news in the service's news array.  
		 */
		$scope.getAllNews = function () {

			return NewsService.all();
		}
	});


	app.controller("newController", function($scope, $stateParams, NewsService, $ionicLoading) {

		/*
			This function will return the news specified by its id.
		 */
		$scope.getIt = function getNews(index) {
			return NewsService.get(index);
		}

		// this we get the id of the article from the url of state
		$scope.newsId = $stateParams.newsId;


		// this function will alows the user to save news 
		$scope.saveMe = function() {



			// this line will return the id of the user in the user_registery
			// it have been panded when userIdentity was created
			// WL.Client.getUserInfo("SingleStepAuthRealm", "attributes.id")
			
			/*
			 $ionicLoading.show({
			      template: 'Loading...'
			    }).then(function(){
			       console.log("The loading indicator is now displayed");
			    });
			*/

		}

	});
})();
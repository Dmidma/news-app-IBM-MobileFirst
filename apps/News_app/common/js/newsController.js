(function() {

	var app = angular.module('news.controller', []);

	app.controller("newsController", function($scope, NewsService, $state, $ionicLoading) {

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


		// 'getNewsFeed'
		// "getOlderNewsFeed"
		
		// call this function first
		fetchNewsWithProcedure("getNewsFeed", 50, null);


		/**
		 * This function will fetch news from SQL adapter.
		 * It will take the name of the procedure that will be called.
		 * In both cases it will store them in the NewsService Angular-service.
		 * The limit is how much the procedure will fetch news.
		 * news_id is the delimiter of the second SQL adapter procedure.
		 * It will be null if the first procedure will be called.
		 * @param  {[type]} procedure [description]
		 * @param {int} [limit] The number of new that will be fetched.
		 * @param {int} [news_id] The id of the news delimiter.
		 * @return {[type]}           [description]
		 */
		function fetchNewsWithProcedure(procedure, limit, news_id) {
			
			// invoke getNewsFeed from ConnectToDatabase adapter
			var connectDatabaseConfig = {
				adapter: 'ConnectToDatabase',
				procedure: procedure,
				parameters: [ ]
			};


			// check which procedure will be called.
			if (news_id != null && procedure == 'getOlderNewsFeed') {
				connectDatabaseConfig.parameters.push(news_id);
				connectDatabaseConfig.parameters.push(limit);
			} else {
				connectDatabaseConfig.parameters.push(limit);
			}

			


			WL.Client.invokeProcedure(connectDatabaseConfig, {
				onSuccess: dataConnectionFunction,
				onFailure: notDataConnectionFunction
			});

			function dataConnectionFunction(response) {

				// get the array that contains the news
				var newsArray = response.responseJSON.resultSet;
				
				// create the news object and store them into NewsService
				createNewsObj(newsArray);	
			}

			function notDataConnectionFunction(response) {
				console.log(response);
			}
		}

		

		/**
		 * Given an array of news, this function will create the object, 
		 * assign its values, and then store it in the NewsService.
		 * @param  {[type]} newsArray [description]
		 * @return {[type]}           [description]
		 */
		function createNewsObj(newsArray) {
			for (var i = 0, len = newsArray.length; i < len; i++) {
				
				// initialize object that will be saved in service
				var createObj = {};

				// In the table id
				createObj.tabId = newsArray[i].id;

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

		$scope.loadMore = function () {
				
			// sanity check
			// TODO: figure away to remove this and replace it with proper load at the beginning
			if (NewsService.leng() == 0) {
				$scope.$broadcast('scroll.infiniteScrollComplete');
				return;
			}

			// get the id of the last news in the NewsService
			var delimiterId = NewsService.get(NewsService.leng() - 1).tabId;

			// get news more older than
			fetchNewsWithProcedure("getOlderNewsFeed", 50, delimiterId);

			// TODO: Check if the fetched news is exactly 50, if less it means the database contains no more
			if (NewsService.leng() % 50 != 0) {
				console.log("No more news in the database, Happy ?");
			}


			// Stop the infinite scroll
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		$scope.searchQuery = '';


		$scope.search = function() {


			// check if we have a valid query
			if ($scope.searchQuery == '' || $scope.searchQuery == null)
				return;
			
			console.log("Searching...");
			// create the query by adding % at the end and beginning
			var query = '%' + $scope.searchQuery + '%';

			// configure the search SQL procedure
			var searchNewsConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'getSearchedNews',
				parameters: [ query ]
			};
			WL.Client.invokeProcedure(searchNewsConfig, {
				onSuccess: newsSearchedFunction,
				onFailure: newsNotSearchedFunction
			});


			function newsSearchedFunction(response) {


				// empty the news service
				NewsService.emptyMe();
				// get the array that contains the news
				var newsArray = response.responseJSON.resultSet;


				// TODO: add a div that will contains the message and not just a popup
				if (newsArray.length == 0) {
					// no match found
					$("#NoMatch").removeClass("hidMe");
					return;
				}

				// create the news object and store them into NewsService
				createNewsObj(newsArray);
			}

			function newsNotSearchedFunction(response) {
				console.log(response);
			}
			$state.reload();
		}

		$scope.clearAll = function() {

			// check if we have a valid query
			if ($scope.searchQuery == '' || $scope.searchQuery == null)
				return;

			$("#NoMatch").addClass("hidMe");
			console.log("Clearing...");

			NewsService.emptyMe();
			// call this function first
			fetchNewsWithProcedure("getNewsFeed", 50, null);

			// clear the search bar
			$scope.searchQuery = '';
		}


	});


	app.controller("newController", function($scope, $stateParams, NewsService, $ionicLoading, SavedNews) {

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
			
			// I will try to use ionicLoading to simulate a toast behavior
			$ionicLoading.show({
				template: 'Saving...'
			}).then(function(){
				console.log("Saving the current news of the user.");
			});

			// get the user id of user_registery table
			// from useIdentity attributes
			var user_id = WL.Client.getUserInfo("SingleStepAuthRealm", "attributes").id;
			
			// get id of news_feed table of the current article to save
			var currentNews = NewsService.get($stateParams.newsId);
			var news_id = currentNews.tabId;

			
			// configure the saving SQL procedure
			var saveNewsConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'saveNewsForUserID',
				parameters: [ user_id, news_id ]
			};
			WL.Client.invokeProcedure(saveNewsConfig, {
				onSuccess: newsSavedFunction,
				onFailure: newsNotSavedFunction
			});
			function newsSavedFunction(response) {
				$ionicLoading.hide();
				$ionicLoading.show({template: "Saved!"});
				setTimeout(function() {$ionicLoading.hide()}, 500);


				// copy the object
				// var savedNew = jQuery.extend(true, {}, currentNews);
				// TODO: fix this
				// savedNew.saved_time = new Date();
				// change its id
				// savedNew.newsId = SavedNews.leng() - 1;
				// add it to the savedNews array
				// SavedNews.add(savedNew);


				// Empty the array of service
				// and make the other page reload the page.
				SavedNews.emptyMe();
				SavedNews.setReload(true);
			}
			
			function newsNotSavedFunction(response) {
				console.log(response);
				$ionicLoading.hide();
				$ionicLoading.show({template: "Not Saved!"});
				setTimeout(function() {$ionicLoading.hide()}, 1000);
			}
		}
	});
})();
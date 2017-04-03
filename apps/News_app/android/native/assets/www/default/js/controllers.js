
/* JavaScript content from js/controllers.js in folder common */
(function() {
	var app = angular.module('starter.controllers', []);


	// filter news controller
	app.controller('filerNewsCtrl', function($scope) {

		$scope.title = "News Sources:";

	});



	// Menu controller
	app.controller('AppCtrl', function($scope, SavedNews, $state) {

		// get userName that will be displayed on the menu
		$scope.userName = WL.Client.getUserInfo("SingleStepAuthRealm", "displayName");


		// This will remove the old <ion-nav-bar>
		$scope.mainIt = $("#FirstNav");

		$scope.mainIt.remove();

		// get the number of saved news
		$scope.nbrSavedNews = SavedNews.leng();

		$scope.$on( "$ionicView.enter", function() {
        	
        	var newNbr = SavedNews.leng();

        	if (newNbr != $scope.nbrSavedNews) {
        		
        		$scope.nbrSavedNews = newNbr;
        	}
    	});

		$scope.goThere = function() {
			$state.go('app.tab.chats');
		}

		$scope.byeBye = function() {
			WL.Client.logout('SingleStepAuthRealm');
			$state.go('lock');
			$("body").append($scope.mainIt);
		}
	});

	


	app.controller('ChatsCtrl', function($scope, SavedNews, $state) {
		

		// get id of the current user
		var user_id = WL.Client.getUserInfo("SingleStepAuthRealm", "attributes").id;	

		$scope.$on( "$ionicView.enter", function( scopes, states ) {
        	if (SavedNews.getReload()) {
        		// get saved news for the current user and save them in the service.
				fetchNewsForCurrentUser(user_id)
        		$state.reload();
        		SavedNews.setReload(false);
        	}
    	});

		

		$scope.fama = false;



		function fetchNewsForCurrentUser(user_id) {
			// invoke getNewsForUserID from ConnectToDatabase adapter
			var fetchNewsConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'getNewsForUserID',
				parameters: [ user_id ]
			};
			WL.Client.invokeProcedure(fetchNewsConfig, {
				onSuccess: fetchedNewsFunction,
				onFailure: notFetchedNewsFunction
			});
			function fetchedNewsFunction(response) {

				// get the result of news
				var newsArray = response.responseJSON.resultSet;


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
					// date of savedTime
					createObj.saved_time = newsArray[i].saved_date;
					// save it 
					saveNews(createObj);
				}

				if (getId() != 0)
					$scope.fama = true;

				// TODO: change it to more appropriate way
				$state.reload();
			}
			function notFetchedNewsFunction(response) {
				console.log(response);
			}
		}


		

		function saveNews(news) {
			SavedNews.add(news);
		}

		function getId() {
			return SavedNews.leng();
		}

		$scope.getAllNews = function () {

			return SavedNews.all();
		}

		$scope.deleteIt = function(index_id) {
			
			// get news table id 
			var news_id = SavedNews.get(index_id).tabId;


			// remove it from the array of service
			SavedNews.deleteMe(index_id);

			// remove it from database
			var user_id = WL.Client.getUserInfo("SingleStepAuthRealm", "attributes").id;
			// remove saved news
			var removeNewsConfig = {
				adapter: 'ConnectToDatabase',
				procedure: 'deleteNewsFromUserID',
				parameters: [ user_id, news_id ]
			};
			WL.Client.invokeProcedure(removeNewsConfig, {
				onSuccess: deletedNewsFunction,
				onFailure: notDeletedNewsFunction
			});

			function deletedNewsFunction(response) {
				
				// console.log(response);
				
				// refresh 
				$state.reload();
				if (getId() == 0) {
					$scope.fama = false;
				}
			}
			function notDeletedNewsFunction(response) {
				console.log(response);
			}
		}	
	});




	app.controller('ChatDetailCtrl', function($scope, $stateParams, SavedNews) {
		/*
			This function will return the news specified by its id.
			// TODO: switch this .getIt() function to a global variable,
			// because in the chat-detail it will be called multiple times.
		 */
		$scope.getIt = function getNews(index) {
			return SavedNews.get(index);
		}

		// this we get the id of the article from the url of state
		$scope.newsId = $stateParams.chatId;
	});




})();
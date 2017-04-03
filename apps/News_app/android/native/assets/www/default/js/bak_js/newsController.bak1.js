
/* JavaScript content from js/bak_js/newsController.bak1.js in folder common */
(function() {

	var app = angular.module('news.controller', []);

	app.controller("newsController", function($scope, $http, NewsService) {

		this.hello = "NEWS:";
		

		/*	
			// Supposedly this section adds an effect to the news item before going to the next view
		
			$(document).on("mousedown", ".newsItem", function() {
				$(this).addClass("clicked");
			});

			$(document).on("mouseup", ".newsItem", function() {
				$(this).removeClass("clicked");
			});

		

			$(document).on("click", ".closeMe", function() {
				$(this).parent().toggle("clicked");
			});
			
		*/
  	
  
		/*
			// need to check the API configuration so I can have the result of multiple key words in a single request		
			var keySearch = [
				"technology",
				"google",
				"IBM",
				"Samsung",
				"Apple",
				"Oracle"
			];
		*/
		

		var fetchNYTAPI = function () {
			var keySearch = [
			"google",
			"IBM",
			"Oracle"
			];
		
	
			for (i = 0, lan = keySearch.length; i < lan; i++) {
				var urla = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
				urla += '?' + $.param({
  					'api-key': "bad0a991f5a04d45afde4b8a6b4556b3",
  					'q': keySearch[i],
  					'sort': "newest"
				});

				var config = {
      				method: 'GET',
      				url: urla
    			};

    			$http(config).then(function successCallback(response) {

    			
          			for (var i = 0, len = response.data.response.docs.length; i < len; i++) {
						var curr = response.data.response.docs[i];
						var createObj = {};
						createObj.medi = false;
						createObj.main = curr.headline.main;
						createObj.snippet = curr.snippet;
						if (curr.multimedia.length > 0) {
							createObj.multimedia = "http://www.nytimes.com/"
							createObj.multimedia += curr.multimedia[1].url;
							createObj.medi = true;
						}
						createObj.sourceImg = "http://icons.iconarchive.com/icons/martz90/circle-addon1/512/new-york-times-icon.png";
						createObj.web_url = curr.web_url;
						createObj.pub_date = curr.pub_date;
						createObj.newsId = getId();

						saveNews(createObj);
					}
    			}, function errorCallback(response) {
	    			console.log(response);
    			});
			}
		};

		var fetchNewsAPI = function (sourca, sorted, sourcaImga) {
		
			var urla = "https://newsapi.org/v1/articles";
			urla += '?' + $.param({
  				'apiKey': "6bdb4189d0a74538a38a31f734259e2e",
  				'sortBy': sorted,
  				'source': sourca
			});

			var config = {
      			method: 'GET',
      			url: urla
    		};

    		$http(config).then(function successCallback(response) {
    			for (i = 0, len = response.data.articles.length; i < len; i++) {
    				
    				var curr = response.data.articles[i];
					var createObj = {};
					if (curr.description != null) {
						createObj.medi = true;
						createObj.main = curr.title;
						createObj.snippet = curr.description;
						createObj.multimedia = curr.urlToImage;
			
						createObj.sourceImg = sourcaImga;
						createObj.web_url = curr.url;
						createObj.pub_date = curr.publishedAt;
						createObj.newsId = getId();

						saveNews(createObj);
					}
    			}
    		}, function errorCallback(response) {
	    		console.log(response);
    		});
		};

		var fetchGuardianAPI = function () {
		
			var config = {
      			method: 'GET',
      			url: "http://content.guardianapis.com/search?section=technology&order-by=newest&show-fields=trailText%2Cthumbnail&page-size=50&api-key=33640a0a-16f3-47e4-8ad6-e4ba6b988618"
    		};

    		$http(config).then(function successCallback(response) {
    			for (i = 0, len = response.data.response.results.length; i < len; i++) {
    				
    				var curr = response.data.response.results[i];
					var createObj = {};
	
					createObj.medi = false;
					
					createObj.main = curr.webTitle;
					createObj.snippet = curr.fields.trailText;
					if (curr.fields.thumbnail != null) {
						createObj.medi = true;
						createObj.multimedia = curr.fields.thumbnail;
					}
					
					createObj.sourceImg = 'https://pbs.twimg.com/profile_images/566207268039823360/lqAeuznl.png';
					createObj.web_url = curr.webUrl;
					createObj.pub_date = curr.webPublicationDate;
					createObj.newsId = getId();

					saveNews(createObj);
				}
    		}, function errorCallback(response) {
	    		console.log(response);
    		});
		};
	

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
		

		

		fetchNYTAPI();
		
		fetchNewsAPI('techcrunch', 
			'popular', 
			"https://s0.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/logo.svg");
		
		fetchNewsAPI('independent', 
			'popular', 
			"https://pbs.twimg.com/profile_images/583628771972018176/ztJn926g.png");
		
		fetchNewsAPI('theverge', 
			'top', 
			"https://cdn3.vox-cdn.com/community_logos/35025/verge-logo-lg.jpg");
		
		fetchNewsAPI('googlenews', 
			'top',
			"http://icons.iconarchive.com/icons/dtafalonso/android-lollipop/512/News-And-Weather-icon.png");
		
		fetchNewsAPI('hackernews', 
			'popular', 
			"https://pbs.twimg.com/profile_images/1405908372/1_400x400.png");

		fetchNewsAPI('thenextweb', 
			'popular', 
			"https://pbs.twimg.com/profile_images/712955373557325824/CZ2ne8yK.jpg");

		fetchNewsAPI('recode', 
			'popular', 
			"http://www.supreality.com/blog/wp-content/uploads/2015/05/XXJazTH3.png");
		
		
		fetchGuardianAPI();
		
	});


	app.controller("newController", function($scope, $stateParams, NewsService) {
		

		/*
			This function will return the news specified by its id.
		 */
		$scope.getIt = function getNews(index) {
			return NewsService.get(index);
		}

		$scope.newsId = $stateParams.newsId;

	});
})();
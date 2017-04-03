
/* JavaScript content from js/newsService.js in folder common */
(function() {
	var service = angular.module('starter.newsservice', []);


	service.factory('NewsService', function() {

		var newsArray = [];

		var random = false;


		return {
			all: function () {
				return newsArray;
			},
			leng : function () {
				return newsArray.length;
			},
			add: function(news) {
				newsArray.push(news);
			},
			get: function(index) {
				return newsArray[index];
			},
			randomly: function() {

				var randArr = Array.from(newsArray);

				var rand =  Math.random();
    			for (i = newsArray.length - 1; i > 0; i--) {
      				
      				// rnd.nextInt(i + 1);
      				var index = Math.round(Math.random() * (i + 1));
      			
      				// Simple swap
      				var a = randArr[index];
      				randArr[index] = randArr[i];
      				randArr[i] = a;
    			}

    			return randArr;
			},
			update: function(arr) {
				newsArray = Array.from(arr);
			},
			setRandomly: function(what) {
				random = what;
			},
			getRandomly: function() {
				return random;
			},
			emptyMe: function() {
				newsArray = [];
			}
		};
	});


	service.factory("SavedNews", function() {
		
		var newsArray = [];

		// checking to reload
		var reload = {value: true};

		return {
			all: function () {
				return newsArray;
			},
			leng : function () {
				return newsArray.length;
			},
			add: function(news) {
				newsArray.push(news);
			},
			get: function(index) {
				return newsArray[index];
			},
			deleteMe: function(index) {
				// remove the element at the specified index
				newsArray.splice(index, 1);

				for (var i = index, len = newsArray.length; i < len; i++) {
					// change the id of the current object
					newsArray[i].newsId--;
				}
			},
			getReload: function() {
				return reload.value;
			},
			setReload: function(value) {
				reload.value = value;
			},
			emptyMe: function() {
				newsArray = [];
			}
		};
	});
})();
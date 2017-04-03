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
			}
		};
	});
})();
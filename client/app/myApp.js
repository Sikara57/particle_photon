var app = angular.module("myApp",['ngRoute','ngResource','angularMoment','ui.materialize',"chart.js"]);

app.config(['$routeProvider','$locationProvider',
	function($routeProvider,$locationProvider){
		$routeProvider
		.when('/', {
			templateUrl:'client/views/accueil.html'
		})
		.when('/liste',{
			templateUrl:'client/views/liste.html',
			controller:'liste.ctrl',
			resolve:{
				liste:function(deviceFactory){
					return deviceFactory.query();
				}
			}
		})
		.when('/device/:id',{
			templateUrl:'client/views/device.html',
			controller:'device.ctrl'
		})
		.otherwise({
			redirectTo:'/'
		});
}]);

app.filter('dateFr',['moment',function(moment){
	return function(date){
		return moment().format('LLL');
	}
}]);

app.config(['$resourceProvider',function($resourceProvider){
	$resourceProvider.defaults.stripTrailingSlashes = false;
}]);
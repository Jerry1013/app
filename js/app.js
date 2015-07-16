'use strict';

/* App Module */

var qdmpApp = angular.module('qdmpApp', [
  'ngRoute',
  'ngAnimate',
  'angularUtils.directives.dirPagination'
]);

qdmpApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/home', {
            templateUrl: 'client/app/partials/home.html' //only accesses $rootScope variables (set by NavCtrl), so it doesn't need its own controller
        }).
        when('/load', {
            templateUrl: 'client/app/partials/load.html',
            controller: 'LoadCtrl'
        }).
        when('/loadDetail/:context/:workflowId?', {
            templateUrl: 'client/app/partials/loadDetail.html',
            controller: 'LoadDetailCtrl'
        }).
        when('/map', {
            templateUrl: 'client/app/partials/map.html',
            controller: 'MapCtrl'
        }).
        when('/mapDetail/:context/:workflowId?', {
            templateUrl: 'client/app/partials/mapDetail.html',
            controller: 'MapDetailCtrl'
        }).
        when('/aggregate', {
            templateUrl: 'client/app/partials/aggregate.html',
            controller: 'AggregateCtrl'
        }).
        when('/test', {
            templateUrl: 'client/app/partials/test.html',
            controller: 'TestCtrl'
        }).
        otherwise({
            redirectTo: '/home'
        });
}]);

//the 'run' method is called immediately after all services are setup, and is used to start up the application
//qdmpApp.run(['$rootScope', '$location', function ($rootScope, $location) {
//    //
//}]);;




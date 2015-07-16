'use strict';

//Displays a page heading, and sub-heading

qdmpApp.directive('pageHeading', function () {
    return {
        restrict: 'E', //type of directive (E for element, A for attribute, C for class.  The default is to allow element or attribute)
        templateUrl: 'client/app/partials/directives/pageHeading.html',
        scope: {
            title: '@',
            description: '@'
        },
        link: function ($scope, element, attrs) {
            
        }
    };
});
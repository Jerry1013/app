'use strict';

//Displays an alert panel that can display a root message, and well as a list of detail messages.  The type of alert can also be modified.
//Parameters:
//  display-type: the type of alert: alert (default), error, secondary, success
//  message: a string the will be displayed in the panel
//  message-details: a string[] that will be along with the message

/* Example Usage
    <alert-panel message="" message-details="detailsArray" display-type="error">
*/

qdmpApp.directive('alertPanel', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/app/partials/directives/alertPanel.html',
        scope: {
            'displayType': '@',
            'message': '@',
            'messageDetails': '=',
            'progress': '@'
        },
        link: function ($scope, element, attrs) {
            $scope.displayError = function () {
                return $scope.displayType === 'error';
            };
            $scope.displaySecondary = function () {
                return $scope.displayType === 'secondary';
            };
            $scope.displaySuccess = function () {
                return $scope.displayType === 'success';
            };
        }
    };
});

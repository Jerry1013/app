'use strict';

//A table for displaying multiple items from an array, while allowing sorting filtering, and an action icon to be displayed

/* Example Usage
    <display-table columns="columns" filters="filters" permissions="permissions" display-data="workflows"></display-table>
*/

qdmpApp.directive('displayTable', function () {
    return {
        restrict: 'E', //type of directive (E for element, A for attribute, C for class.  The default is to allow element or attribute)
        templateUrl: 'client/app/partials/directives/displayTable.html',
        scope: {
            columns: '=',
            filters: '=',
            permissions: '=',
            displayData: '=',
            actionIconSrc: '@',
            actionIconClick: '&',
            sortOptions: '='
        },
        link: function ($scope, element, attrs) {
            //this should eventually be set as an attribute, and determines if there is a search box displayed
            $scope.has_search = true;
            $scope.search = '';

            //setup the filtering storage and function, which powers the select inputs
            $scope.filter_values = {}; //each select input can add a new property to here, with the name being the data item property to filter on, and the value is the filter value
            $scope.fieldFilter = function () {
                return function (item) { //for each item in the input list, return true if they should be kept, or false if they should be filtered out
                    var output = true;
                    $.each($scope.filter_values, function (key, value) { //for each property in filter_values, use its name/value to filter
                        if ((value) && (item[key].indexOf(value) == -1)) { //if the value is non-null (which excludes the first select option), and the input value's appropriate property doesn't contains any of the filter text, then filter out the input value
                            output = false;
                            return;
                        }
                    })
                    return output;
                };
            }

            //called by a column header's onClick event to update sorting
            $scope.changeSorting = function (column) {
                var sort = $scope.sortOptions;
                if (sort.column == column) {
                    sort.descending = !sort.descending;
                } else {
                    sort.column = column;
                    sort.descending = false ;
                }
            };

            //used by the HTML to display/hide certain elements based on permissions
            $scope.hasPermission = function (permission) {
                return ($scope.permissions) && ($scope.permissions.indexOf(permission) >= 0);
            };

            $scope.click = function(id) {
                $scope.actionIconClick({ id: id });
            };
        }
    };
});
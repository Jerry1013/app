'use strict';

qdmpApp.controller(
	'NavCtrl',
	['$scope', 'UserService', '$location', '$rootScope', '$timeout',
    function ($scope, UserService, $location, $rootScope, $timeout) {
        /* Active Page Selection in UI */

        //returns the name of the category of the current page being viewed
        function getActiveCategory($location) {
            var active_page = $location.$$path.substr(1);
            var active_category = '';
            $.each(config.nav, function (i, cat_obj) {
                $.each(cat_obj.pages, function (j, page_obj) {
                    if (page_obj.name == active_page) {
                        active_category = cat_obj.name;
                    }
                })
            });
            return active_category;
        }

        //get the active category, so it can be highlighted in the UI
        $scope.active_category = getActiveCategory($location);

        //whenever the location changes, make sure the proper menu section is highlighted
        $rootScope.$on("$locationChangeStart", function (event, next, current) {
            $scope.active_category = getActiveCategory($location);
        });

        //returns true if the specfified page is the currently visible page
        $rootScope.isActivePage = function (viewLocation) {
            var curPath = $location.path();
            return $location.path().indexOf(viewLocation) == 0;
        };



        /* Environment Information */

        //get the user's permissions, and filter the navigation options to just those they have access to
        $scope.filterNavByPermissions = function () {
            UserService.getCurrentPermissions().success(function (permissions) {
                var newNav = [];
                $.each(config.nav, function (i, category) {
                    //create an empty copy of the category, and just add the proper pages to it
                    var newCategory = { name: category.name, pages: [] };
                    $.each(category.pages, function (j, page) { //for each page (load, map, etc)
                        if (arrayContainsArray(permissions, page.permissions))
                            newCategory.pages.push(page);
                    });

                    //only add categories where the user has access to at least 1 page
                    if (newCategory.pages.length > 0)
                        newNav.push(newCategory);
                });

                $rootScope.nav = newNav;

                //after the menu items are loaded, active the foundation javascript, so it can enable the drop-down menus
                //give the slight delay, since the menu items aren't created until after this method ends
                $timeout(function () {
                    $(document).foundation();
                }, 500);
            });
        };
        $scope.filterNavByPermissions();

        //get the current environment, and store it for later reference
        UserService.getCurrentEnvironment().success(function (environment) {
            $scope.currentEnvironment = environment;
        });
        
        //get a list of available environments, so the use can switch between them
        var setAvailableEnvironments = function () {
            UserService.getAvailableEnvironments().success(function (environments) {
                $scope.availableEnvironments = environments.filter(function (el) {
                    return el.name != $scope.currentEnvironment.name;
                });
            });
        };
        setAvailableEnvironments();

        //update the current environment and make sure the permissions reflect the new environment
        //setCurrentEnvironment sets a cookie that makes all API calls specify the proper environment, and it also return s JSON object for the environment, which we store
        $scope.selectEnvironment = function (environment) {
            UserService.setCurrentEnvironment(environment.id).then(function (environment) {
                $scope.currentEnvironment = environment.data;
                $scope.filterNavByPermissions();
            }).then(function () {
                setAvailableEnvironments();
            });
        };
    }]);

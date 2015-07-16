'use strict';

qdmpApp.factory("UserService", ['$http', function ($http) {
    var currentPermissionsPromise = null;

    return {

        //Summary:
        //  Get information about all environments that the user has access to
        //Result Layout: JSON[]:
        //  Id, MetastoreId, ClientId, Name, Description, EnvironmentTypeId, CreateUser, CreateDate, UpdateUser, UpdateDate
        //  Metastore
        //    Id, ServerName, DatabaseName, ConnectionString, CreateUser, CreateDate, UpdateUser, UpdateDate
        //  EnvironmentType
        //    Id, Name, Color, WarningLevel, CreateUser, CreateDate, UpdateUser, UpdateDate
        getAvailableEnvironments: function (successCallback, errorCallback) {
            var apiPromise = $http.get("api/User/GetAvailableEnvironments");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get information about the current environment
        //Result Layout: JSON:
        //  Id, MetastoreId, ClientId, Name, Description, EnvironmentTypeId, CreateUser, CreateDate, UpdateUser, UpdateDate
        //  Metastore
        //    Id, ServerName, DatabaseName, ConnectionString, CreateUser, CreateDate, UpdateUser, UpdateDate
        //  EnvironmentType
        //    Id, Name, Color, WarningLevel, CreateUser, CreateDate, UpdateUser, UpdateDate
        getCurrentEnvironment: function (successCallback, errorCallback) {
            var apiPromise = $http.get("api/User/GetCurrentEnvironment");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get the current user's permissions from the server, caching them, as they are unlikely to change during a session, and are always validated on the server, so there is no security risk in it being outdated
        //Result Layout: string[]
        getCurrentPermissions: function () {
            if (currentPermissionsPromise)
                return currentPermissionsPromise;
            else {
                currentPermissionsPromise = $http.get("api/User/GetCurrentPermissions");
                servicePromiseProcessing(currentPermissionsPromise);
                return currentPermissionsPromise;
            }
        },

        //Summary:
        //  Set the current environment id in the cookies, so that all further API calls represent that id.
        //  **Also clears the cache permissions promise, so all future calls will get the permissions of the new environment
        //Result Layout: JSON:
        //  Id, MetastoreId, ClientId, Name, Description, EnvironmentTypeId, CreateUser, CreateDate, UpdateUser, UpdateDate
        //  Metastore
        //    Id, ServerName, DatabaseName, ConnectionString, CreateUser, CreateDate, UpdateUser, UpdateDate
        //  EnvironmentType
        //    Id, Name, Color, WarningLevel, CreateUser, CreateDate, UpdateUser, UpdateDate
        setCurrentEnvironment: function (environmentId, successCallback, errorCallback) {
            currentPermissionsPromise = null;

            var apiPromise = $http.post("api/User/SetCurrentEnvironment/" + environmentId, "");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },
    }
}]);
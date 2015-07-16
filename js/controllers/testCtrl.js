'use strict';

qdmpApp.controller('TestCtrl', ['$scope', 'UserService', 'WorkflowService', function ($scope, UserService, WorkflowService) {
    $scope.title = "Hey There!";
    //WorkflowService.stageMetadataWorkflow('lockId', 4321, 2, 'STAGING', 1, 1).success(function (permissions) {
    //    $scope.permissions = permissions;
    //}, function (data, status, headers, config) {
    //    $scope.permissions = ["Error Getting Exceptions: " + data.message + ", Exception Type: " + data.exceptionType + ", Exception Message: " + data.exceptionMessage];
    //});
    //WorkflowService.stageMetadataSourceEntity('lockId', 111, 'Entity 1', 'Description', 'Daily', '*.txt', 'Insert', 1, false, 0, false,
    //    false, false, 'password', '|', '"', '\\n', null, null).success(function (permissions) {
    //    $scope.permissions = permissions;
    //}, function (data, status, headers, config) {
    //    $scope.permissions = ["Error Getting Exceptions: " + data.message + ", Exception Type: " + data.exceptionType + ", Exception Message: " + data.exceptionMessage];
    //});
    //WorkflowService.stageMetadataSourceEntityDatasetDatatypeMap('lockId', 222, 'Column 1', 1, '35', '', 1).success(function (permissions) {
    //        $scope.permissions = permissions;
    //    }, function (data, status, headers, config) {
    //        $scope.permissions = ["Error Getting Exceptions: " + data.message + ", Exception Type: " + data.exceptionType + ", Exception Message: " + data.exceptionMessage];
    //    });

    WorkflowService.getConformanceWorkflow(1000699).success(function (permissions) {
        //$scope.simpleValue = JSON.parse(permissions.lockId);
        var test = permissions;
    }, function (data, status, headers, config) {
        $scope.permissions = ["Error Getting a Lock: " + data.message + ", Exception Type: " + data.exceptionType + ", Exception Message: " + data.exceptionMessage];
    });


    //UserService.getCurrentPermissions().success(function (permissions) {
    //    $scope.permissions = permissions;
    //}, function (data, status, headers, config) {
    //    $scope.permissions = ["Error Getting Exceptions: " + data.message + ", Exception Type: " + data.exceptionType + ", Exception Message: " + data.exceptionMessage];
    //});
}]);
'use strict';

qdmpApp.controller(
	'MapCtrl',
	['$scope', '$rootScope', '$location', 'WorkflowService', 'UserService',
    function ($scope, $rootScope, $location, WorkflowService, UserService) {
        //cache the permissions list, and then expose a method for the HTML to display/hide certain elements based on them
        //permissions must be stored in $scope, so if the view calls hasPermissions before $scope.permissions is set, it will be re-called afterwards
        UserService.getCurrentPermissions().success(function (permissions) {
            $scope.permissions = permissions;

            //create a function that will be called when the users clicks the icon next to each workflow displayed
            var linkContext = $scope.hasPermission('ModifyWorkflow') ? 'modify' : 'view';
            $scope.linkIconSrc = $scope.hasPermission('ModifyWorkflow') ? 'client/app/img/icons/pencil.png' : 'client/app/img/icons/magnifyingGlass.png';
            $scope.workflowAction = function (id) {
                $location.path('mapDetail/' + linkContext + '/' + id);
            };
        });
        $scope.hasPermission = function (permission) {
            return ($scope.permissions) && ($scope.permissions.indexOf(permission) >= 0);
        };




        /* Filter Logic */

        $scope.filters = [
            { name: 'input', options: [] },
            { name: 'output', options: [] }
        ]

        function addWorkflowFiltersToOptions(target, data, field) {
            $.each(data, function (i, obj) {
                var val = obj[field];
                var filter = { value: val, text: val };
                target.options.push(filter);
            })
        }

        WorkflowService.getHost(true).success(function (data) {
            var filter = $scope.filters[0]; //input
            var field = 'desc';
            addWorkflowFiltersToOptions(filter, data, field);

            filter = $scope.filters[1]; //output
            field = 'desc';
            addWorkflowFiltersToOptions(filter, data, field);
        })




        /* Data Load / Display Logic */

        //setup a list of fields to display, along with their display name
        var fields_displayed = {
            'id': 'id',
            'executorType': 'engine',
            'activeFlg': 'active',
            'inputRelativeDatasetObjectDescription': 'input',
            'outputRelativeDatasetObjectDescription': 'output',
        }

        //store a simple string[] of just the display names, to be used by the display table in setting up the columns
        $scope.columns = [];
        $.each(fields_displayed, function (key, val) {
            $scope.columns.push(val);
        })

        //stores sorting information for the table
        $scope.sortOptions = {
            column: 'updateDt',
            descending: true
        };

        //for each displayed property name from data item, you can add a function with the same name to mappingFunctions, and it will be used to transalte that field
        var mappingFunctions = {};
        mappingFunctions.activeFlg = function (val) {
            return val ? '✓' : '';
        }

        //load the workflows to display, creating a new object for each that contains only the necessary fields, and performing any specified mapping
        WorkflowService.getWorkflow(null, 'CONFORMANCE').success(function (workflows) {
            var final_workflows = [];
            $.each(workflows, function (i, workflow) {
                var displayWorkflow = {};
                displayWorkflow.updateDt = workflow.updateDt; //used for the initial sorting, but not displayed
                $.each(fields_displayed, function (src, dest) {
                    var value = workflow[src];
                    if (mappingFunctions[src]) {
                        value = mappingFunctions[src](value);
                    };
                    displayWorkflow[dest] = value;
                });
                final_workflows.push(displayWorkflow);
            });

            $scope.workflows = final_workflows;
        });
    }]);
'use strict';

qdmpApp.controller(
	'MapDetailCtrl',
	['$scope', '$rootScope', '$location', '$routeParams', '$window', '$timeout', '$q', 'WorkflowService', 'UserService',
    function ($scope, $rootScope, $location, $routeParams, $window, $timeout, $q, WorkflowService, UserService) {
        $scope.context = $routeParams.context;
        $scope.workflowId = $routeParams.workflowId;
        $scope.fileLayoutOptions = {};

        //setup the alert panel, and a function to call it
        $scope.alertDisplayType = "alert"; //can also be error, success or secondary
        $scope.alertMessage = null;
        $scope.alertDetails = null;
        $scope.alertProgress = -1;
        var displayAlertMesage = function (displayType, errorMessage, errorDetails, alertProgress) {
            $scope.alertDisplayType = displayType;
            $scope.alertMessage = errorMessage;
            $scope.alertDetails = errorDetails;
            $scope.alertProgress = alertProgress ? alertProgress : -1;
            $('html, body').animate({ scrollTop: 0 }, 'fast');
        };
        var clearAlertMessage = function () {
            $scope.alertMessage = null;
            $scope.alertProgress = -1;
        };

        /* setup initial view */

        //setup the page for the specified context, and validate that the context is valid
        var setupViewContext = function () {
            $scope.title = "View Workflow";
            $scope.description = "View details for mapping workflow";
            $scope.isFormDisabled = true;
            $scope.fileLayoutOptions.readOnly = true; //set all form elements to disabled, so the workflow can't be edited
            $scope.requiredPermission = "ViewWorkflow";
        }
        var setupContext = function () {
            if ($scope.context === "add") {
                $scope.title = "Add Workflow";
                $scope.description = "Create a new workflow for mapping data into staging";
                $scope.isFormDisabled = false;
                $scope.requiredPermission = "ModifyWorkflow";
            }
            else if ($scope.context === "modify") {
                $scope.title = "Modify Workflow";
                $scope.description = "Update an existing workflow for mapping data into staging";
                $scope.isFormDisabled = false;
                $scope.requiredPermission = "ModifyWorkflow";
            }
            else if ($scope.context === "view") {
                setupViewContext();
            }
            else
                displayAlertMesage("error", "Invalid display context for this page");
        };
        setupContext();

        //validate permissions, and call setupForm()
        UserService.getCurrentPermissions().success(function (userPermissions) {
            if (userPermissions.indexOf($scope.requiredPermission) >= 0) {
                setupForm();
            }
            else
                displayAlertMesage("error", "You do not have permissions to access this page");
        });

        //this is called only once permissions are validated
        var setupForm = function () {
            if ($scope.context === "add") {
                //setup the add form***

                WorkflowService.getLock(null, null).then(function (lockId) {
                    $scope.lockId = lockId.data.lockId;
                    loadSelectBoxes();
                    $scope.displayForm = true;
                }).catch(function (error) {
                    displayAlertMesage("error", "Error getting a lock.");
                });
            } else {
                //make sure a workflow id was passed in
                if (!$scope.workflowId) {
                    displayAlertMesage("error", "Workflow Id was not passed in");
                    return;
                };

                //try to get a lock before displaying the form, if this is the modify context
                var needLock = $scope.context === 'modify';
                $q.when(needLock ? WorkflowService.getLock($scope.workflowId, null) : null).then(function (lockId) {
                    //if in the modify context validate and store the lcok id
                    if (needLock) {
                        //if the lock is null, then the workflow is already locked, so just switch to the view context
                        if (lockId.data.lockId === null) {
                            setupViewContext();
                            displayAlertMesage("alert", "This workflow is locked for editing by " + lockId.data.lockOwner);
                        }
                        else
                            $scope.lockId = lockId.data.lockId;
                    }

                    $scope.fileLayoutOptions.readOnly = $scope.isFormDisabled; //set it here, as you know that it won't change, such as due to a lock existing, since the binding won't update after initially being set

                    loadSelectBoxes();

                    //load the actual workflow data, then populate the form with it, and display it

                    WorkflowService.getConformanceWorkflow($scope.workflowId).then(function (values) {
                        populateForm(values.data);
                        $scope.displayForm = true;
                    }).catch(function (error) {
                        displayAlertMesage("error", "Error loading workflow id " + $scope.workflowId);
                        return;
                    });
                }).catch(function (error) {
                    displayAlertMesage("error", "Error getting a lock.");
                });
            }
        }

        //setup the empty form when is the add context
        var defaultForm = function () {
            $scope.workflow = {};
            $scope.fileLayoutRows = [];
        }

        //pre-load the form with existing workflow data
        var populateForm = function (stagingWorkflow) {
            //input
            $scope.workflow = {};
            $scope.workflow.name = stagingWorkflow.name;
            $scope.workflow.engineId = stagingWorkflow.executionSubsystemId;
            $scope.workflow.isActive = stagingWorkflow.activeFlg;

            //new
            $scope.workflow.inputTable = stagingWorkflow.inputTable;
            $scope.workflow.inputputKeys = stagingWorkflow.inputputKeys;
            $scope.workflow.inputSourceExpressions = stagingWorkflow.inputSourceExpressions;

            //output
            $scope.workflow.outputSchema = stagingWorkflow.outputObjectCatalog;
            $scope.workflow.outputTable = stagingWorkflow.outputObjectName;
        };

        //load all select boxes from a service
        var loadSelectBoxes = function () {
            $scope.dataTypeOptionsPromise = WorkflowService.getDatatypeRegex(); //used when setting column settings for the file layout section
            $scope.engineOptionsPromise = WorkflowService.getWorkflowExecutionSubsystem();
            $scope.engineOptionsPromise.success(function (data) {
                $scope.engineOptions = [];
                $.each(data, function (i, item) {
                    $scope.engineOptions.push({
                        id: item.workflowExecutionSubsystemId, name: item.workflowExecutionSubsystemName,
                        defaultStagingHostDesc: item.defaultStagingHostDesc //store this as well, so it can be displayed as the output schema
                    });
                });
            });
            WorkflowService.getSourceSystem().success(function (data) {
                $scope.sourceSystemOptions = [];
                $.each(data, function (i, item) {
                    $scope.sourceSystemOptions.push({ id: item.id, name: item.systemNm });
                });
            });
            WorkflowService.getSourceEntityStageStrategy().success(function (data) {
                $scope.stageStrategies = data;
            });
            WorkflowService.getSourceEntityFileFrequency().success(function (data) {
                $scope.frequencyOptions = data;
            });
            WorkflowService.getSourceEntityControlFileExtension().success(function (data) {
                $scope.controlFileExtensionOptions = data;
            });
            WorkflowService.getSourceEntityControlFileDelimiter().success(function (data) {
                $scope.controlFileDelimiterOptions = data;
            });
            WorkflowService.getSourceEntityTextQualifier().success(function (data) {
                $scope.textQualifierOptions = data;
            });
            WorkflowService.getSourceEntityColumnDelimiter().success(function (data) {
                $scope.columnDelimiterOptions = data;
            });
            WorkflowService.getSourceEntityRowDelimiter().success(function (data) {
                $scope.rowDelimiterOptions = data;
            });
        };

        //enable interactive Foundation elements
        $timeout(function () {
            $(document).foundation();
        }, 500);

        /* watch for the user leaving the page, and if they have modfied the form, then verify that they want to leave (and release any locks) */

        //called when navigating away from the page
        $scope.$on('$locationChangeStart', function (event) {
            if ($scope.mapDetailForm.$dirty) {
                var answer = confirm("Are you sure you want to leave this page?  Doing so will lose any changes made.")
                if (!answer) {
                    event.preventDefault();
                    return;
                }
            }

            //if they are leaving the page, and have a lock, then release it
            if ($scope.lockId)
                WorkflowService.releaseLock($scope.lockId, $scope.workflowId);
        });

        //called before closing or refreshing the browser.  we don't know the result of what the user does, so we can't release any locks
        window.onbeforeunload = function (event) {
            if ($scope.mapDetailForm.$dirty) {
                var message = 'Are you sure you want to leave this page?  Doing so will lose any changes made.';
                if (typeof event == 'undefined')
                    event = window.event;
                if (event)
                    event.returnValue = message;
                return message;
            }
        }

        //once the controller is destoryed, removed the event handler from 'window'
        $scope.$on("$destroy", function () {
            window.onbeforeunload = null;
        });

        /* staging logic */

        var stageMetadataWorkflow = function () {
            return WorkflowService.stageMetadataWorkflow(
                $scope.lockId,
                $scope.workflowId,
                $scope.workflow.engineId,
                'STAGING',
                null, //not needed as staging workflows load from a file
                null, //not needed as staging workflows load from a file
                $scope.workflow.outputSchema,
                $scope.workflow.outputTable);
        };

        var stageWorfklow = function () {
            displayAlertMesage("alert", "Preparing worfklow data...");

            return stageMetadataWorkflow()
                .then(stageMetadataSourceEntity)
                .then(stageMetadataSourceEntityDatasetDatatypeMap);
        };


        /* functions to be called by the view */
        $scope.cancel = function () {
            $window.history.back();
        };

        $scope.save = function () {
            //make sure the form is valid, using simple client-side checks (required, max length, etc)
            if (!$scope.loadDetailForm.$valid) {
                $scope.$broadcast('show-errors-check-validity');
                displayAlertMesage("error", "Errors exist in the form");
                return;
            }

            //validate the file layout manually
            var fileLayoutErrors = validateFileLayout();
            if (fileLayoutErrors.length > 0) {
                displayAlertMesage("error", "There are issues with the file layout", fileLayoutErrors);
                return;
            }

            //validate the workflow before committing it (it is valid if validateStagingWorkflow returns an empty array)
            stageWorfklow()
                .then(function () {
                    return WorkflowService.validateStagingWorkflow($scope.lockId, $scope.workflowId);
                })
                .then(function (validations) {
                    if (validations.data.length > 0) {
                        displayAlertMesage("error", "Error validating workflow", validations.data);
                        return;
                    }

                    //commit the workflow using the appropriate method
                    if ($scope.context === "add") {
                        WorkflowService.addConformanceWorkflow($scope.lockId).then(function (workflowId) {
                            $scope.mapDetailForm.$setPristine();
                            $location.path('load');
                        }).catch(function (error) {
                            displayAlertMesage("error", "Error adding workflow.  Please view the event log.", validations.data);
                        });
                    } else if ($scope.context === "modify") {
                        WorkflowService.modifyConformanceWorkflow($scope.lockId, $scope.workflowId).then(function () {
                            $scope.mapDetailForm.$setPristine();
                            displayAlertMesage("success", "Workflow updated");
                        }).catch(function (error) {
                            displayAlertMesage("error", "Error modifying workflow.  Please view the event log.", validations.data);
                        });
                    }
                }).catch(function (result) {
                    displayAlertMesage("error", "Error validating/saving the workflow");
                });
        }
    }]);
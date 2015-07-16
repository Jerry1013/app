'use strict';

qdmpApp.controller(
	'LoadDetailCtrl',
	['$scope', '$rootScope', '$location', '$routeParams', '$window', '$timeout', '$q', 'WorkflowService', 'UserService',
    function ($scope, $rootScope, $location, $routeParams, $window, $timeout, $q, WorkflowService, UserService) {
        $scope.context = $routeParams.context;
        $scope.workflowId = $routeParams.workflowId;
        $scope.isEntityInfoActive = true; //this determines which tab is displayed between entity info and file layout
        $scope.fileLayoutOptions = {};
        $scope.fileLayoutOptions.pageSize = 50;
        
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
            $scope.description = "View details for loading workflow";
            $scope.isFormDisabled = true;
            $scope.fileLayoutOptions.readOnly = true; //set all form elements to disabled, so the workflow can't be edited
            $scope.requiredPermission = "ViewWorkflow";
        }
        var setupContext = function () {
            if ($scope.context === "add") {
                $scope.title = "Add Workflow";
                $scope.description = "Create a new workflow for loading data into staging";
                $scope.isFormDisabled = false;
                $scope.requiredPermission = "ModifyWorkflow";
            }
            else if ($scope.context === "modify") {
                $scope.title = "Modify Workflow";
                $scope.description = "Update an existing workflow for loading data into staging";
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
        if ($scope.errorMessage)
            return;

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
                    $scope.dataTypeOptionsPromise.then(function (dataTypes) {
                        setupFileLayoutColumns(dataTypes.data);
                        defaultForm();
                    });
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
                    $scope.getWorkflowPromise = WorkflowService.getStagingWorkflow($scope.workflowId);
                    $q.all([$scope.dataTypeOptionsPromise, $scope.getWorkflowPromise]).then(function (values) {
                        setupFileLayoutColumns(values[0].data);
                        populateForm(values[1].data);
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

        var setupFileLayoutColumns = function (dataTypes) //dataTypes is the list of available data types to show in the file layout section
        {
            $scope.fileLayoutColumns = [];
            var emptyRegex = /(?:)/;
            var dataTypeOptions = [];
            var defaultDataTypeId;
            $.each(dataTypes, function (i, item) {
                dataTypeOptions.push({ id: item.datatypeId, name: item.datatypeName });
                if (item.datatypeName.toUpperCase() === 'VARCHAR')
                    defaultDataTypeId = item.datatypeId;
            });

            //setup the actual column info, with some of them having a custom function to parse values during a bulk update
            $scope.fileLayoutColumns.push({ name: 'stageColumnName', displayName: 'Column Name', width: '*', fieldType: 'text', isRequired: true, validationPattern: emptyRegex, defaultValue: '' });

            var datatypeIdColumn = { name: 'datatypeId', displayName: 'Data Type', width: '8rem', fieldType: 'select', options: dataTypeOptions, isRequired: true, validationPattern: emptyRegex, defaultValue: defaultDataTypeId };
            datatypeIdColumn.batchParseItem = function (colValue, rowItem) {
                //conform certain datatype aliases
                if (colValue.toUpperCase() === 'INTEGER')
                    colValue = 'INT';

                //standard select logic
                var option = selectItemFromArray(colValue, datatypeIdColumn.options, 'name', true)
                if (option)
                    rowItem.datatypeId = option.id;

                //if the data type wasn't varchar (the default value), then default length to 0, so if there isn't a value for it, then it won't use the normal default, which is based off of varchar
                if (rowItem.datatypeId != datatypeIdColumn.defaultValue)
                    rowItem.length = '0';
            };
            $scope.fileLayoutColumns.push(datatypeIdColumn);

            var lengthColumn = { name: 'length', displayName: 'Length', width: '4rem', fieldType: 'text', isRequired: false, validationPattern: /^[0-9]+$/, defaultValue: 50 };
            lengthColumn.batchParseItem = function (colValue, rowItem) {
                var cleansedValue = colValue.replace(/[() ]/g, '');
                var commaIndex = cleansedValue.indexOf(',');

                if (commaIndex < 0)
                    rowItem.length = cleansedValue;
                else {
                    rowItem.length = cleansedValue.substring(0, commaIndex);
                    rowItem.scale = cleansedValue.substring(commaIndex + 1);
                }
            };
            $scope.fileLayoutColumns.push(lengthColumn);

            $scope.fileLayoutColumns.push({ name: 'scale', displayName: 'Precision', width: '4rem', fieldType: 'text', isRequired: false, validationPattern: /^[0-9]+$/, defaultValue: 0 });
        }

        //setup the empty form when is the add context
        var defaultForm = function()
        {
            $scope.workflow = {};
            $scope.sourceEntities = [{}];
            $scope.curEntity = $scope.sourceEntities[0];

            $scope.fileLayoutRows = [];
        }

        //pre-load the form with existing workflow data
        var populateForm = function (stagingWorkflow) {
            //input
            $scope.workflow = {};
            $scope.workflow.name = stagingWorkflow.name;
            $scope.workflow.engineId = stagingWorkflow.executionSubsystemId;
            $scope.workflow.isActive = stagingWorkflow.activeFlg;
            $scope.workflow.sourceSystemId = stagingWorkflow.sourceEntities[0].systemId; //assumed that they are all the same

            //source entity
            $scope.sourceEntities = stagingWorkflow.sourceEntities;
            $scope.curEntity = stagingWorkflow.sourceEntities[0];

            //file layout row data
            $scope.fileLayoutRows = [];
            $.each(stagingWorkflow.datasetMappings, function (i, item) { //951 records!!! (1000001)
                //if (i > 101) return; //temporary
                var newMapping = {};
                newMapping.editTableRowNum = i + 1;
                newMapping.datasetDatatypeMapId = item.datasetDatatypeMapId;
                newMapping.stageColumnName = item.stageColumnName;
                newMapping.datatypeId = item.datatypeId;
                newMapping.length = item.length;
                newMapping.scale = item.scale;
                $scope.fileLayoutRows.push(newMapping);
            });

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
            if ($scope.loadDetailForm.$dirty) {
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
            if ($scope.loadDetailForm.$dirty) {
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

        var stageMetadataSourceEntity = function () {
            //create an initial empty promise, that will be the root of the call chain
            var dfd = $q.defer();
            dfd.resolve();
            var entityPromise = dfd.promise;

            //for each source entity, add the promise from calling its stage method
            $.each($scope.sourceEntities, function (i, entity) {
                entityPromise = entityPromise.then(function () {
                    return WorkflowService.stageMetadataSourceEntity(
                        $scope.lockId,
                        entity.id,
                        entity.entityNm,
                        entity.entityDesc,
                        entity.frequency,
                        entity.sourceFileMask,
                        entity.stageStrategy,
                        $scope.workflow.sourceSystemId, //all source entities share the same source system (in the modify context, this is loaded in the UI as the source system of the first source entity, so if a workflow had source entities with different source systems (which shouldn't happen), they would get overwritten when modifying the workflow)
                        entity.allowStringTruncation,
                        entity.numHeaderRows,
                        entity.deleteSourceFileFlg,
                        entity.controlFileFlg,
                        entity.unzipFileFlg,
                        entity.unzipFilePassword,
                        entity.columnDelimiter,
                        entity.textQualifier,
                        entity.rowDelimiter,
                        entity.controlFileExt,
                        entity.controlFileDelimiter);
                });
            });

            return entityPromise;
        };

        var stageMetadataSourceEntityDatasetDatatypeMap = function () {
            //create an initial empty promise, that will be the root of the call chain
            var dfd = $q.defer();
            dfd.resolve();
            var entityPromise = dfd.promise;

            //for each source entity, add the promise from calling its stage method
            $.each($scope.fileLayoutRows, function (i, entity) {
                //skip the entity, if it is the default value from the editTable directive, appended at the end of the list
                if (entity.isEditTableDefault)
                    return;

                entityPromise = entityPromise.then(function () {
                    return WorkflowService.stageMetadataSourceEntityDatasetDatatypeMap(
                        $scope.lockId,
                        entity.datasetDatatypeMapId,
                        entity.stageColumnName,
                        entity.datatypeId,
                        entity.length,
                        entity.scale,
                        entity.editTableRowNum);
                }).then(function () {
                    $scope.alertProgress = (i / $scope.fileLayoutRows.length) * 100;
                });
            });

            return entityPromise;
        };

        var stageWorfklow = function () {
            displayAlertMesage("alert", "Preparing worfklow data...");

            return stageMetadataWorkflow()
                .then(stageMetadataSourceEntity)
                .then(stageMetadataSourceEntityDatasetDatatypeMap);
        };

        //validate the file layout manually, since the Angular validation only works on the records visible, so it won't check all record if pagination is used
        var validateFileLayout = function () {
            var validationErrors = [];
            $.each($scope.fileLayoutRows, function (i, entity) {
                //skip the entity, if it is the default value from the editTable directive, appended at the end of the list
                if (entity.isEditTableDefault)
                    return;

                if ((!entity.stageColumnName) || (entity.stageColumnName === ''))
                    validationErrors.push('Record ' + entity.editTableRowNum + ' is missing a column name');
                if (!entity.datatypeId)
                    validationErrors.push('Record ' + entity.editTableRowNum + ' is missing a data type');
            });

            return validationErrors;
        };




        /* functions to be called by the view */

        $scope.addNewSourceEntity = function () {
            $scope.curEntity = {};
            $scope.curEntity.entityNm = "";
            $scope.sourceEntities.push($scope.curEntity);
        };

        $scope.cancel = function () {
            $window.history.back();
        };

        $scope.removeCurrentSourceEntity = function () {
            if ($scope.sourceEntities.length > 1) {
                $scope.sourceEntities = removeItemFromArray($scope.curEntity, $scope.sourceEntities);
                $scope.curEntity = $scope.sourceEntities[0];
            }
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
                .then(function() {
                    return WorkflowService.validateStagingWorkflow($scope.lockId, $scope.workflowId);
                })
                .then(function (validations) {
                        if (validations.data.length > 0) {
                            displayAlertMesage("error", "Error validating workflow", validations.data);
                            return;
                        }

                        //commit the workflow using the appropriate method
                        if ($scope.context === "add") {
                            WorkflowService.addStagingWorkflow($scope.lockId).then(function (workflowId) {
                                $scope.loadDetailForm.$setPristine();
                                $location.path('load');
                            }).catch(function (error) {
                                displayAlertMesage("error", "Error adding workflow.  Please view the event log.", validations.data);
                            });
                        } else if ($scope.context === "modify") {
                            WorkflowService.modifyStagingWorkflow($scope.lockId, $scope.workflowId).then(function () {
                                $scope.loadDetailForm.$setPristine();
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
'use strict';

qdmpApp.factory("WorkflowService", ['$http', function ($http) {
    return {
        //NOTE: many methods require a client id, but that is specified automatically by the cookies, so it is not reflected in the function parameters

        //Summary:
        //  Called after a workflow is staged and validated, this will move the staged workflow data into the final tables.
        //Params:
        //  lockId (string): the lock used when staging the workflow
        //Result Layout: string
        //  The result is the workflow_id of the added workflow
        addStagingWorkflow: function (lockId) {
            var apiPromise = $http.post("api/Workflow/AddStagingWorkflow",
                {
                    lockId: lockId
                });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get detailed information about a specific conformance (map) workflow
        //Params:
        //  workflowId (long): the id of the workflow to get
        //Result Layout: JSON:
        //  WorkflowId, ClientId, ExecutionSubsystemId, Name, Desc, Type, DispatchCondition, ActiveFlg, CreateUser, CreateDt,
        //    UpdateUser, UpdateDt, ClientNm, ExecutionSubsystemName, ExecutorType, PrimaryInputDatasetId, PrimaryOutputDatasetId,
        //    InputSystemNm, InputObjectCatalog, InputObjectName, InputDatasetClassificationDesc, InputDatasetClassificationId,
        //    InputRelativeDatasetObjectDescription, OutputSystemNm, OutputObjectCatalog, OutputObjectName,
        //    OutputDatasetClassificationDesc, OutputDatasetClassificationId, OutputRelativeDatasetObjectDescription
        //  TableConformanceMappings[]:
        //    TableConformanceMapId, SourceTableDatasetId, TargetTableDatasetId, SourceColumnExpression, TargetColumnName,
        //    LookupTableDatasetId, LookupColumnName, ActiveFlg, CreateUser, CreateDt, UpdateUser, UpdateDt
        getConformanceWorkflow: function (workflowId) {
            var apiPromise = $http.get("api/Workflow/GetConformanceWorkflow",
                    {
                        params: {
                            workflowId: workflowId
                        }
                    });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of datasets, optionally filtering on the host id
        //Parameters:
        //  hostId (int: optional): filter the result to just this host id
        //Result Layout: JSON[]:
        //  DatasetId, ClientId, DatasetName, DatasetDesc, ObjectType, ObjectName, HostId, DataClassificationId, ExpirationCondition
        //  ExpirationStatusId, PrimaryKeyColumns, DataColumns, PartitionColumns, EntityTypeId, DatasetQuerySql, ActiveFlg, CreateUser
        //  CreateDt, UpdateUser, UpdateDt
        getDataset: function (hostId) {
            var apiPromise = $http.get("api/Workflow/GetDataset",
                    {
                        params: {
                            hostId: hostId
                        }
                    });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of dataset classifications
        //Result Layout: JSON[]:
        //  DatasetClassificationId, DatasetClassificationDesc, CreateUser, CreateDt, UpdateUser, UpdateDt
        getDatasetClassification: function () {
            var apiPromise = $http.get("api/Workflow/GetDatasetClassification");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of regular expressions for various data types
        //Result Layout: JSON[]:
        //  DatatypeId, DatatypeName, DatatypeRegex, CreateUser, CreateDt, UpdateUser, UpdateDt
        getDatatypeRegex: function () {
            var apiPromise = $http.get("api/Workflow/GetDatatypeRegex");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of hosts accessible by this metastore
        //Parameters:
        //  onlyDataStores (bool: optional): when true, restrict results to only data stores
        //Result Layout: JSON[]:
        //  Id, Hostname, Desc, Username, Catalog, Port, ConnectionType, OdbcDriver, JdbcDriver, OledbProvider, Protocol, AuthToken,
        //  AuthSecretKey, TimeZone, CreateUser, CreateDt, UpdateUser, UpdateDt
        //Usage Notes:
        //  Maps to the output filter in the databable UI
        getHost: function (onlyDataStores) {
            var apiPromise = $http.get("api/Workflow/GetHost",
                    {
                        params: {
                            onlyDataStores: onlyDataStores
                        }
                    });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a lock id for a workflow, so that you can edit it.  You can also set workflowId to null to get a lock to use when
        //  creating a new workflow that is not currently in the database.
        //Params:
        //  workflowId (string): the id of the workflow to get a lock on.  this can also be null if you are getting a lock for a
        //    new workflow
        //  lockTimeoutInMinutes (int): the number of minutes that the lock should exist for, before being automatically released.
        //    this can be set to null, and a system default will be used
        //Result Layout: JSON: if a lock was already in use by another user, lockId is set to null
        //  ObjectType, ObjectId, LockId, LockOwner, CreateDt
        getLock: function (workflowId, lockTimeoutInMinutes) {
            var apiPromise = $http.get("api/Workflow/GetLock",
                    {
                        params: {
                            workflowId: workflowId,
                            lockTimeoutInMinutes: lockTimeoutInMinutes
                        }
                    });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of all entity file column delimiters currently in use by the various source entities
        //Result Layout: string[]
        getSourceEntityColumnDelimiter: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceEntityColumnDelimiter");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of all control file delimiters currently in use by the various source entities
        //Result Layout: string[]
        getSourceEntityControlFileDelimiter: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceEntityControlFileDelimiter");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of all control file extensions currently in use by the various source entities
        //Result: string[]
        getSourceEntityControlFileExtension: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceEntityControlFileExtension");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  [Currently only stubbed out, but will eventually return a list of files on a server that are not prepped for loading]
        //Result: string[]
        getSourceEntityFileCandidate: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceEntityFileCandidate");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of all file frequencies currently in use by the various source entities ('Daily', 'Quarterly', etc)
        //Result: string[]
        getSourceEntityFileFrequency: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceEntityFileFrequency");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of all entity file row delimiters currently in use by the various source entities
        //Result Layout: string[]
        getSourceEntityRowDelimiter: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceEntityRowDelimiter");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of all staging strategies currently in use by the various source entities (Ex. 'Insert')
        //Result: string[]
        getSourceEntityStageStrategy: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceEntityStageStrategy");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of all entity file text qualifiers currently in use by the various source entities
        //Result Layout: string[]
        getSourceEntityTextQualifier: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceEntityTextQualifier");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of all source systems
        //Result Layout: JSON[]:
        //  Id, ClientId, SystemNm, SystemDesc, WorkDirectory, ArchiveDirectory, ReceiveDirectory, PreprocessDirectory,
        //  IssueDirectory, LogFileDirectory, DataIngestionProtocol, SftpFlg, FtpsFlg, FtpSite, FtpUser, FtpPackagePath,
        //  MaxFtpConnections, MaxSimultaneousDownloadsPerConnection, NumFtpRetryAttempts, MaxConcurrentProcesses,
        //  FileSizePctDiffThreshold, Status, ApiHostId, ApiRetryAttempts, ActiveFlg, CreateUser, CreateDt, UpdateUser, UpdateDt
        //Usage Notes:
        //  Maps to the input filter in the datatable UI
        getSourceSystem: function () {
            var apiPromise = $http.get("api/Workflow/GetSourceSystem");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get detailed information about a specific staging (load) workflow
        //Params:
        //  workflowId (long): the id of the workflow to get
        //Result Layout: JSON:
        //  ClientId, ExecutionSubsystemId, Id, ClientNm, Name, ExecutionSubsystemName, ExecutorType,
        //  DispatchCondition, ActiveFlg, CreateDt, CreateUser, UpdateDt, UpdateUser,
        //  InputRelativeDatasetObjectDescription, OutputRelativeDatasetObjectDescription,
        //  Type, Primary, InputDatasetId, InputSystemNm, InputObjectCatalog, InputObjectName,
        //  InputDataClassificationId, InputDataClassificationDesc, Primary, OutputDatasetId, OutputSystemNm, OutputObjectCatalog,
        //  OutputObjectName, OutputDataClassificationId, OutputDataClassificationDesc
        //  SourceEntities[]:
        //    Id, SystemId, DatasetId, EntityNm, EntityDesc, Frequency, FrequencyDays, IncludeHeader, NumHeaderRows, StageStrategy,
        //    StageTableNm, NextExtractValue, StagePackagePath, SourceFileMask, FileFormatId, ControlFileFlg, ControlFileExt,
        //    ControlFileDelimiter, ColumnDelimiter, TextQualifier, AllowStringTruncation, RowDelimiter, PreProcessFunction,
        //    DatabaseHost, DatabaseNm, DatabaseUsername, RequiredFlg, RequiredDateDiff, DownloadOnlyFlg, UnzipFileFlg,
        //    UnzipFilePassword, Status, ActiveFlg, StdConfigId, MatchConfigId, DeleteSourceFileFlg, ParentSourceEntityId,
        //    CreateUser, CreateDt, UpdateUser, UpdateDt
        //  DatasetMappings[]: (sorted by ColumnPosition)
        //    DatasetDatatypeMapId, DatasetId, SourceAttributeName, StageColumnName, DatatypeId, Length, Scale, ColumnPosition,
        //    CreateUser, CreateDt, UpdateUser, UpdateDt
        getStagingWorkflow: function (workflowId) {
            var apiPromise = $http.get("api/Workflow/GetStagingWorkflow",
                    {
                        params: {
                            workflowId: workflowId
                        }
                    });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of data about workflows
        //Parameters:
        //  workflowId (long: optional): when set, return only this exact workflow
        //  workflowType (string: optional): when set, return only this type of workflow
        //    Ex: 'STAGING' (Load), 'CONFORMANCE' (Mapping), 'AGGREGATION' (Aggregation)
        //Result Layout: JSON[]: (sorted by UpdateDt DESC)
        //  ClientId, ExecutionSubsystemId, Id, ClientNm, Name, ExecutionSubsystemName, ActiveFlg, InputRelativeDatasetObjectDescription,
        //  OutputRelativeDatasetObjectDescription, Type, ExecutorType, CreateUser, CreateDt, UpdateUser, UpdateDt
        getWorkflow: function (workflowId, workflowType) {
            var apiPromise = $http.get("api/Workflow/GetWorkflow",
                    {
                        params: {
                            workflowId: workflowId,
                            workflowType: workflowType
                        }
                    });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Get a list of execution engines available (Ex: SSIS/Oozie)
        //Result Layout: JSON[]:
        //  WorkflowExecutionSubsystemId, WorkflowExecutionSubsystemName, WorkflowExecutionSubsystemDesc, WorkflowExecutorType,
        //  ManifestBuildDirectory, ManifestDropDirectory, ManifestDropProtocol, ManifestDropFormat, ManifestDropHostId,
        //  ManifestPickupDirectory, ManifestPickupProtocol, ManifestPickupHostId, ManifestProcessDirectory, ManifestExecutionDirectory,
        //  WorkflowExecutionSubsystemRootDirectory, MaxConcurrentWorkflowInstances, CreateUser, CreateDt, UpdateUser, UpdateDt,
        //  DefaultStagingHostId, DefaultStagingHostDesc
        getWorkflowExecutionSubsystem: function () {
            var apiPromise = $http.get("api/Workflow/GetWorkflowExecutionSubsystem");
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Called after a workflow is staged and validated, this will move the staged workflow data into the final tables, updating
        //  an existing workflow.
        //Params:
        //  lockId (string): the lock used when staging the workflow
        //  workflowId (long): the workflow to be modified.  it must match the id the lock was originally created for
        //Result Layout: string
        //  The result is the workflow_id of the added workflow
        modifyStagingWorkflow: function (lockId, workflowId) {
            var apiPromise = $http.post("api/Workflow/ModifyStagingWorkflow",
                {
                    lockId: lockId,
                    workflowId: workflowId
                });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Release a lock that was obtained with getLock
        //Params:
        //  lockId (string): the lock used when staging the workflow
        //  workflowId (long): the workflow the lock was created for, or null if the lock was not created against an existing workflow
        releaseLock: function (lockId, workflowId) {
            var apiPromise = $http.post("api/Workflow/ReleaseLock",
                {
                    lockId: lockId,
                    workflowId: workflowId
                });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  After calling stageMetadataWorkflow, you can then call this for each source entity to be attached to the workflow.
        //Parameters:
        //  id: when adding a new source entity, leave this null
        stageMetadataSourceEntity: function (lockId, id, entityName, entityDesc, frequency, sourceFileMask, stageStrategy, systemId,
            allowStringTruncation, numHeaderRows, deleteSourceFileFlg, controlFileFlg, unzipFileFlg, unzipFilePassword, columnDelimiter,
            textQualifier, rowDelimiter, controlFileExt, controlFileDelimiter) {
            var apiPromise = $http.post("api/Workflow/StageMetadataSourceEntity",
                {
                    lockId: lockId,
                    id: id,
                    entityName: entityName,
                    entityDesc: entityDesc,
                    frequency: frequency,
                    sourceFileMask: sourceFileMask,
                    stageStrategy: stageStrategy,
                    systemId: systemId,
                    allowStringTruncation: allowStringTruncation,
                    numHeaderRows: numHeaderRows,
                    deleteSourceFileFlg: deleteSourceFileFlg,
                    controlFileFlg: controlFileFlg,
                    unzipFileFlg: unzipFileFlg,
                    unzipFilePassword: unzipFilePassword,
                    columnDelimiter: columnDelimiter,
                    textQualifier: textQualifier,
                    rowDelimiter: rowDelimiter,
                    controlFileExt: controlFileExt,
                    controlFileDelimiter: controlFileDelimiter
                });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  After calling stageMetadataWorkflow, you can then call this for each source entity datatype map to be attached to the workflow.
        //Parameters:
        //  datasetDataTypeMapId: when adding a new datatype map, leave this null
        stageMetadataSourceEntityDatasetDatatypeMap: function (lockId, datasetDataTypeMapId, stageColumnName, datatypeId, length, scale, columnPosition) {
            var apiPromise = $http.post("api/Workflow/StageMetadataSourceEntityDatasetDatatypeMap",
                {
                    lockId: lockId,
                    datasetDataTypeMapId: datasetDataTypeMapId,
                    stageColumnName: stageColumnName,
                    datatypeId: datatypeId,
                    length: length,
                    scale: scale,
                    columnPosition: columnPosition,
                });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Start the process of staging workflow information to be validated and committed to the database, whether as a new workflow,
        //  or as an update to an existing one.  Once this function is called, you must then call stageMetadataSourceEntity and
        //  stageMetadataSourceEntityDatasetDatatypeMap, both of which can be called multiple times.
        //Parameters:
        //  workflowId: when adding a new workflow, leave this null
        //  workflowType: load = 'STAGING'
        stageMetadataWorkflow: function (lockId, workflowId, workflowExecutionSubsystemId, workflowType, inputObjectCatalog, inputObjectName,
            outputObjectCatalog, outputObjectName) {
            var apiPromise = $http.post("api/Workflow/StageMetadataWorkflow",
                {
                    lockId: lockId,
                    workflowId: workflowId,
                    workflowExecutionSubsystemId: workflowExecutionSubsystemId,
                    workflowType: workflowType,
                    inputObjectCatalog: inputObjectCatalog,
                    inputObjectName: inputObjectName,
                    outputObjectCatalog: outputObjectCatalog,
                    outputObjectName: outputObjectName
                });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },

        //Summary:
        //  Called after a workflow is staged, and will validate that there are no errors preventing the workflow from being created/
        //  modified.
        //Params:
        //  lockId (string): the lock used when staging the workflow
        //  workflowId (long): the id of the workflow to validate.  this can be null if you are validating a new workflow being created,
        //    which does not have an id yet
        //Result Layout: string
        //  The result is the lock id if one was returned, or null if a lock was already in use.
        validateStagingWorkflow: function (lockId, workflowId) {
            var apiPromise = $http.get("api/Workflow/ValidateStagingWorkflow",
                {
                    params: {
                        lockId: lockId,
                        workflowId: workflowId
                    }
                });
            servicePromiseProcessing(apiPromise);
            return apiPromise;
        },
    }
}]);
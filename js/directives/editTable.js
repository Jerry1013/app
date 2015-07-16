'use strict';

//A table for both displaying and editing data.  You must pass in a list of objects
//to display, as well as a list of columns, and their settings.
//
//*This directive will add a new record at the end of the row-data array, which will have the property
//  isEditTableDefault set to true on it.  This should be filtered out when dealing with the array.
//
//*Validation is only functional for the records that are currently displayed on the active page.  If
//  the data list is long, and spans pages, not all records will be validated.  There should always be a
//  secondary for of validation afterwards, as the built in validation is mainly for hinting to the user
//  while entering the data.
//
//columns: an array of objects that must have the following fields:
//  name: the name of the property to display in the column
//  displayName: the label to display for the column
//  width: the width of the column.  you can either use percentages, pixels or rems
//  fieldType: the type of input element to display (must be 'text' or 'select')
//    options: if fieldType is 'select', you must specify the options to have within the select, as an
//             array of objects with 'id' and 'name' properties
//  isRequired: if true, the field will be highlighted if left empty, alerting the user
//  validationPattern: this is an optional property, but if it exists, it must be set to a regex pattern, which
//                     will be used to validate the field (/^[0-9]+$/ to specify positive whole numbers only)
//  defaultValue: when a new record is added, this will be the field's initial value
//  batchParseItem: an optional function for custom parsing of a value for this field, when batch updating the table.
//                  the function must have the following signature: function (colValue, rowItem)
//                  the function should update the rowItem object appropriately (possibly multiple properties), and not reutrn anything
//                  the columns are all processed in array order when doing bulk updates
//tableOptions: an object with the following properties
//  readOnly: this attribute does not maintain its binding, so the first value it is set to is kept, so don't set
//            it to an initial value, expecting to change it later
//  pageSize: the number of items to show in a single page.  after this number, pagination will occur

/* Example Usage
    <edit-table row-data="fileLayoutRows" columns="fileLayoutColumns" table-options="fileLayoutOptions"></edit-table>
*/

qdmpApp.directive('editTable', function () {
    return {
        restrict: 'E', //type of directive (E for element, A for attribute, C for class.  The default is to allow element or attribute)
        templateUrl: 'client/app/partials/directives/editTable.html',
        scope: {
            columns: '=',
            rowData: '=',
            readOnly: '=',
            tableOptions: '='
        },
        link: function ($scope, element, attrs) {
            $scope.filterText = null;
            $scope.batchUpdates = {}; //stores any text entered for batch updates

            //this is a blank record that is always present at the end of the table, and when modified, will turn itself into a normal record, and create a new dummy record after itself
            var addDummyRecord = function () {
                var dummyRecord = {};

                //for each property of the record, set it to a function that just waits to be called with a value (when a user types into that column)
                $.each($scope.columns, function (index, item) {
                    dummyRecord[item.name] = function (newValue) {
                        //newValue will be undefined if this is called as a getter, so don't do anything
                        if (!newValue)
                            return;

                        //set all columns to their default value
                        $.each($scope.columns, function (index, subItem) {
                            dummyRecord[subItem.name] = subItem.defaultValue;
                        });

                        //update the proper field with what the user had entered so far
                        dummyRecord[item.name] = newValue;

                        dummyRecord.editTableRowNum = $scope.rowData.length;

                        //this is no longer the default record
                        delete dummyRecord.isEditTableDefault;

                        //create a new dummy record, since this record isn't one any more
                        addDummyRecord();
                    };
                });
                //dummyRecord.editTableRowNum = $scope.rowData.length + 1;
                dummyRecord.isEditTableDefault = true;
                $scope.rowData.push(dummyRecord);
            };
            
            var resetRowNumbers = function () {
                for (var i = 0; i < $scope.rowData.length; i++)
                    $scope.rowData[i].editTableRowNum = i + 1;
            }

            $scope.addRecord = function (index) {
                var newRecord = {};

                //set all columns to their default value
                $.each($scope.columns, function (index, item) {
                    newRecord[item.name] = item.defaultValue;
                });

                //if there was no specified index, or it is too high, just add the item at the end of the array
                if ((!index) || (index >= $scope.rowData.length)) {
                    newRecord.editTableRowNum = $scope.rowData.length + 1;
                    $scope.rowData.push(newRecord);
                } else { //add it at the specified index
                    //make sure the index is valid
                    if (index < 0)
                        index = 0;

                    //insert the new mapping at the correct location in the array, and adjust all subsequent records' index value
                    $scope.rowData.splice(index, 0, newRecord);
                    resetRowNumbers();
                }
            };

            $scope.removeRecord = function (record) {
                if (!record)
                    throw "A valid record must be passed to editTable.removeRecord";

                removeItemFromArray(record, $scope.rowData);
                resetRowNumbers();
            };

            $scope.batchSave = function () {
                //split a string on a new line character, and remove blank lines
                var stringToArray = function (stringValue) {
                    var result = [];
                    $.each(stringValue.split('\n'), function (i, item) {
                        //if (item.trim().length > 0)
                            result.push(item.trim());
                    });
                    return result;
                }

                //split the input strings into arrays, removing any blank lines
                var batchArrays = {};
                $.each($scope.columns, function (i, column) {
                    if ($scope.batchUpdates[column.name]) {
                        batchArrays[column.name] = stringToArray($scope.batchUpdates[column.name]);
                        console.log(batchArrays[column.name]);
                    }
                });

                //find the max length of the different arrays
                var maxArrayLength = 0;
                $.each(batchArrays, function (i, item) {
                    if (item.length > maxArrayLength)
                        maxArrayLength = item.length;
                });

                //create a new record for each index of the batch arrays
                var newRowData = [];
                for (var i = 0; i < maxArrayLength; i++) {
                    var newRecord = {};
                    var recordHasData = false; //if this never gets set to true (all columns are empty for this index), then don't add the record

                    $.each($scope.columns, function (colIndex, column) {
                        if ((batchArrays[column.name]) && (batchArrays[column.name][i])) {
                            var value = batchArrays[column.name][i].trim();
                            recordHasData = true;

                            if (column.batchParseItem)
                                column.batchParseItem(value, newRecord);
                            else if (column.fieldType === 'text')
                                newRecord[column.name] = value;
                            else if (column.fieldType === 'select') {
                                var option = selectItemFromArray(value, column.options, 'name', true)
                                if (option)
                                    newRecord[column.name] = option.id;
                            }
                        } else if (!newRecord[column.name]) //even though there is no specified value here, make sure it wasn't set by a custom function before defaulting it
                            newRecord[column.name] = column.defaultValue;
                    });

                    if (recordHasData) {
                        newRecord.editTableRowNum = newRowData.length + 1;
                        newRowData.push(newRecord);
                    }
                }

                //update the actual row data (this should trigger the watch, which will add the dummy record to it)
                $scope.rowData = newRowData;

                //close the dialog
                $('a.close-reveal-modal').trigger('click');
            };

            $scope.batchCancel = function () {
                $('a.close-reveal-modal').trigger('click');
            };

            //once rowData is set, add a dummy record for adding new records
            $scope.$watch('rowData', function (newValue, oldValue) {
                if (newValue)
                    addDummyRecord();
            });
        }
    };
});
'use strict';

//wraps a form element in a template that gives it a label, and an error message the appears appropriately when the form is invalid

/* Example Usage
    <form-field label="Description" error-text="Description is required">
        <input name="description" type="text" placeholder="" required ng-maxlength="50" ng-model="description" ng-disabled="isFormDisabled" />
    </form-field>
    <form-field label="Engine" error-text="Engine is required">
        <select name="engine" required ng-model="selectedEngineId" ng-options="o.id as o.name for o in engineOptions" ng-disabled="isFormDisabled" />
    </form-field>
    <form-field label="Description" do-show-errors="false">
        <input type="text" placeholder="" />
    </form-field>
*/

qdmpApp.directive('formField', function () {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'client/app/partials/directives/formField.html',
        scope: {
            'label': '@',
            'errorText': '@',
            'doShowErrors': '='
        }
    };
});

'use strict';

//an attribute directive that adds the 'error' class to a div surrounding an input element, which turns on Foundation's error styling
//the surrounding form element must have the data-abide attribute for Foundation to add the error styling
//the input element must be using the ng-model attribute directive
//the following code can be called to force the display of all invalid fields, such as when trying to save: $scope.$broadcast('show-errors-check-validity');
//  you can also reset all displayed errors, such as when clearing out a form: $scope.$broadcast('show-errors-reset');
//this code is based on code from the following post: http://blog.yodersolutions.com/bootstrap-form-validation-done-right-in-angularjs/

/* Example Usage
    <div show-errors>
        <label>
            Name
            <input type="text" name="name" placeholder="" ng-maxlength="5" ng-model="name" required ng-disabled="isFormDisabled" />
        </label>
        <small class="error">Name is required</small>
    </div>
    <div show-errors="false"> <!--this will disable the attribute, which is useful when you always have the attribute in a template, but only want to activate it based on a variable-->
        <label>
            Name
            <input type="text" name="name" placeholder="" ng-maxlength="5" ng-model="name" required ng-disabled="isFormDisabled" />
        </label>
        <small class="error">Name is required</small>
    </div>
*/

qdmpApp.directive('showErrors', [
    '$timeout', function ($timeout) {
        var linkFn = function (scope, el, attrs, formCtrl) {
            if (scope.doShowErrors === false)
                return;

            var blurred = false; //store if the field has ever been blurred, since fields the user has not entered and left should not display an error

            //find the input element, convert it to an angular object, and then get its name attribute
            var inputEl = el[0].querySelector('input, select');
            var inputNgEl = angular.element(inputEl);
            var inputName = inputNgEl.attr('name');
            if (!inputName)
                throw "show-errors element has no child input elements with a 'name' attribute";

            var toggleClasses = function (invalid) {
                el.toggleClass('error', invalid);
            };

            //check validity after the user leaves the field, and set the error class appropriately
            inputNgEl.bind('blur', function () {
                blurred = true;
                var formElement = formCtrl[inputName];
                if (formElement) //this will be null if the input element does not have the ng-model attribute
                    return toggleClasses(formCtrl[inputName].$invalid);
            });

            //watch for changes to the valid status of a field
            scope.$watch(function () {
                return formCtrl[inputName] && formCtrl[inputName].$invalid;
            }, function (invalid) {
                //if the user hasn't entered and left the field, then don't show an error, even if the field is invalid
                if (!blurred)
                    return;
 
                return toggleClasses(invalid);
            });

            //when the specified message is broadcast on the scope, show all errors, regardless of blurred (this is helpful if submitting a form, and showing all fields that caused the form to be invalid)
            scope.$on('show-errors-check-validity', function () {
                return toggleClasses(formCtrl[inputName].$invalid);
            });

            //when the specified message is broadcase on the scope, hide all errors (this is helpful after clearing out the form, as required fields shouldn't show an error until the user goes back to them, or they try to submit)
            scope.$on('show-errors-reset', function () {
                return $timeout(function () {
                    el.removeClass('error');
                    return blurred = false;
                }, 0, false);
            });
        };

        return {
            restrict: 'A',
            require: '^form',
            link: linkFn
        };
    }
]);
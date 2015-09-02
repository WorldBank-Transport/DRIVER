(function () {
    'use strict';

    /* ngInject */
    function NumericRangeField() {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'numeric-range-field'],
            templateUrl: 'scripts/filterbar/numeric-range.html',
            controller: 'numericRangeController',
            scope: {
                data: '=',
                label: '='
            },
            link: function(scope, elem, attrs, ctlArray) {
                init();

                function init() {
                    scope.filter = {};
                    scope.error = {};
                }

                /**
                 * A simple wrapper around driver-filterbar's updateFilter function;
                 *  filters should only be updated when data validates
                 *
                 * @param filterLabel {string} label of which field to filter
                 * @param filterObj {object} filter data
                 */
                scope.updateFilter = function(filterLabel, filterObj) {
                    if (scope.isMinMaxValid()) {
                        ctlArray[0].updateFilter(filterLabel, filterObj);
                    }
                };

                /**
                 * When called, evaluate filter.min and filter.max to ensure they're valid;
                 * set classes properly by copying controller's `error` value to this scope
                 */
                scope.isMinMaxValid = function() {
                    var validity = ctlArray[1].isMinMaxValid(scope.filter.min, scope.filter.max);
                    scope.error = ctlArray[1].error;
                    return validity;
                };
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('numericRangeField', NumericRangeField);

})();

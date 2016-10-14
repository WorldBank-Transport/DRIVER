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
                var filterBarCtl = ctlArray[0];
                var numericRangeCtl = ctlArray[1];
                init();

                scope.$on('driver.filterbar:restored', function() {
                    init();
                });

                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === scope.label) {
                        scope.filter = filter.value;
                        scope.isMinMaxValid();
                    }
                });

                scope.$on('driver.filterbar:reset', function() {
                    scope.filter.min = null;
                    scope.filter.max = null;
                    scope.updateFilter(scope.label, scope.filter);
                });

                function init() {
                    scope.filter = {'_rule_type': 'intrange'};
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
                        filterBarCtl.updateFilter(filterLabel, filterObj);
                    }
                };

                /**
                 * When called, evaluate filter.min and filter.max to ensure they're valid;
                 * set classes properly by copying controller's `error` value to this scope
                 */
                scope.isMinMaxValid = function() {
                    var validity = numericRangeCtl.isMinMaxValid(scope.filter.min, scope.filter.max);
                    scope.error = numericRangeCtl.error;
                    return validity;
                };
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('numericRangeField', NumericRangeField);

})();

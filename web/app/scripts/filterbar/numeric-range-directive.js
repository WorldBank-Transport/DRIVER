(function () {
    'use strict';

    /* ngInject */
    function NumericRangeField() {
        var module = {
            restrict: 'A',
            require: '^driver-filterbar',
            templateUrl: 'scripts/filterbar/numeric-range.html',
            scope: {
                data: '=',
                label: '='
            },
            link: function(scope, elem, attrs, filterCtl) {
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
                scope.updateFilter = function(fLabel, fObj) {
                    if (scope.isMinMaxValid()) {
                        filterCtl.updateFilter(fLabel, fObj);
                    }
                };

                $('div.dropdown.numrange ul.dropdown-menu').on('click', function (event) {
                    event.stopPropagation();
                });

                /**
                 * When called, evaluate filter.min and filter.max to ensure they're valid
                 */
                scope.isMinMaxValid = function() {
                    if (typeof scope.filter.min === 'number' &&  typeof scope.filter.max === 'number') {
                        var minMaxValid = scope.filter.min <= scope.filter.max;
                        if (!minMaxValid) {
                            scope.error.classes = 'alert-danger';
                            scope.error.btnClasses = 'btn-danger';
                        } else {
                            scope.error.classes = '';
                            scope.error.btnClasses = 'btn-primary';
                        }
                        return minMaxValid;
                    }
                    scope.error.classes = '';
                    scope.error.btnClasses = 'btn-primary';
                    return true;
                };
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('numericRangeField', NumericRangeField);

})();

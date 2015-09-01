(function () {
    'use strict';

    /* ngInject */
    function NumericRangeField(RecordSchemas, RecordState) {
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

                scope.updateFilter = function(fLabel, fObj) {
                    if (scope.isMinMaxValid()) {
                        filterCtl.updateFilter(fLabel, fObj);
                    }
                };

                $('div.dropdown.numrange ul.dropdown-menu').on('click', function (event) {
                    event.stopPropagation();
                });

                function init() {
                    scope.filter = {};
                    scope.error = {};
                }

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

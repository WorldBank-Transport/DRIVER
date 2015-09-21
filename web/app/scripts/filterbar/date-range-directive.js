(function () {
    'use strict';

    /* ngInject */
    function DateRangeField() {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'date-range-field'],
            templateUrl: 'scripts/filterbar/date-range.html',
            controller: 'dateRangeController',
            link: function(scope, elem, attrs, ctlArray) {
                var filterLabel = '__dateRange';
                var filterBarCtl = ctlArray[0];
                var dateRangeCtl = ctlArray[1];
                init();
                scope.calendarOptions = {'format': filterBarCtl.dateTimeFormat};

                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === filterLabel) {
                        scope.dtMin = filter.value.min;
                        scope.dtMax = filter.value.max;
                        scope.isMinMaxValid();
                    }
                });

                // On change of DT value
                scope.onDtRangeChange = function() {
                    scope.updateFilter(filterLabel, {'min': scope.dtMin, 'max': scope.dtMax});
                };

                function init() {
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
                    var validity = dateRangeCtl.isMinMaxValid({'min': scope.dtMin, 'max': scope.Max});
                    scope.error = dateRangeCtl.error;
                    return validity;
                };

            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('dateRangeField', DateRangeField);

})();

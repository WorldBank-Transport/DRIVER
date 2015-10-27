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
                var dtRange = {};
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
                scope.$watch('dtMin', function(newMin) {
                    $('#dtMinField').datepicker('update', newMin);
                    dtRange.min = scope.dtMin;
                    if (scope.isMinMaxValid()) {
                        scope.updateFilter(filterLabel, dtRange);
                    }
                });
                scope.$watch('dtMax', function(newMax) {
                    $('#dtMaxField').datepicker('update', newMax);
                    if (scope.isMinMaxValid()) {
                        dtRange.max = scope.dtMax;
                    }
                    scope.updateFilter(filterLabel, dtRange);
                });

                // On change of DT value
                scope.onDtRangeChange = function() {
                    dtRange.min = scope.dtMin;
                    dtRange.max = scope.dtMax;
                    scope.updateFilter(filterLabel, dtRange);
                };

                function init() {
                    // Today
                    var defaultMax = new Date();
                    // 90 days ago
                    var defaultMin = new Date(moment(defaultMax) - moment.duration({days:90}));
                    dtRange.min = defaultMin;
                    dtRange.max = defaultMax;
                    $('#dtMaxField').datepicker('update', defaultMax);
                    $('#dtMinField').datepicker('update', defaultMin);
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

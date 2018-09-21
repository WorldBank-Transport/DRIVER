(function () {
    'use strict';

    /* ngInject */
    function WeatherField($timeout) {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'weather-field'],
            templateUrl: 'scripts/filterbar/weather.html',
            controller: 'weatherController',
            scope: true,
            link: function(scope, elem, attrs, ctlArray) {
                var filterbarController = ctlArray[0];
                var weatherController = ctlArray[1];

                scope.updateFilter = updateFilter;
                scope.weatherValues = weatherController.weatherValues;
                scope.domID = 'weather-filter-select';
                scope.label = '__weather';

                init();

                function init() {
                    // use `%timeout` to ensure that the template is rendered before selectpicker logic
                    $timeout(function() {
                        $('#' + scope.domID).selectpicker();
                    });
                }

                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === scope.label) {
                        setValue(filter.value);
                    }
                });

                scope.$on('driver.filterbar:reset', function() {
                    setValue('');
                });

                function setValue(value) {
                    // Update model
                    scope.value = value;
                    $timeout(function() {
                        // Update UI
                        $('#' + scope.domID).selectpicker('refresh');
                        $('#' + scope.domID).val(value);
                        // Update filters
                        updateFilter();
                    });
                }

                /**
                * A simple wrapper around driver-filterbar's updateFilter function;
                *  filters should only be updated when data validates
                */
                function updateFilter() {
                    filterbarController.updateFilter(scope.label, scope.value);
                }
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('weatherField', WeatherField);

})();

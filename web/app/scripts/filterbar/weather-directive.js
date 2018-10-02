(function () {
    'use strict';

    /* ngInject */
    function WeatherField($timeout) {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'weather-field'],
            templateUrl: 'scripts/filterbar/weather.html',
            controller: 'weatherController',
            bindToController: true,
            controllerAs: 'ctl',
            scope: {},
            link: function(scope, elem, attrs, ctlArray) {
                var filterbarController = ctlArray[0];
                var weatherController = ctlArray[1];

                scope.ctl.updateFilter = updateFilter;
                scope.ctl.weatherValues = weatherController.weatherValues;
                scope.ctl.domID = 'weather-filter-select';
                scope.ctl.label = '__weather';

                init();

                function init() {
                    // use `%timeout` to ensure that the template is rendered before selectpicker logic
                    $timeout(function() {
                        $('#' + scope.ctl.domID).selectpicker();
                    });
                }

                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === scope.ctl.label) {
                        setValue(filter.value);
                    }
                });

                scope.$on('driver.filterbar:reset', function() {
                    setValue([]);
                });

                function setValue(value) {
                    // Update model
                    scope.ctl.value = value;
                    $timeout(function() {
                        // Update UI
                        $('#' + scope.ctl.domID).selectpicker('refresh');
                        $('#' + scope.ctl.domID).val(value);
                        // Update filters
                        updateFilter();
                    });
                }

                /**
                * A simple wrapper around driver-filterbar's updateFilter function;
                *  filters should only be updated when data validates
                */
                function updateFilter() {
                    filterbarController.updateFilter(scope.ctl.label, scope.ctl.value);
                }
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('weatherField', WeatherField);

})();

/* globals angular */
(function () {
    'use strict';

    /* ngInject */
    function QualityField($timeout, WebConfig) {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'quality-field'],
            templateUrl: 'scripts/filterbar/quality.html',
            controller: 'qualityController',
            bindToController: true,
            controllerAs: 'ctl',
            scope: {},
            link: function(scope, elem, attrs, controllers) {
                var filterbarController = controllers[0];
                var selectElem = angular.element(elem[0]).find('select');
                scope.ctl.label = attrs.qualityField;
                scope.ctl.qualityChecks = [];
                if (WebConfig.qualityChecks.outsideBoundary.visible) {
                    scope.ctl.qualityChecks.push({
                        key: 'checkOutsideBoundary',
                        label: 'RECORD.OUT_OF_BOUNDS'
                    });
                }
                scope.ctl.value = [];
                scope.ctl.updateFilter = updateFilter;

                scope.$on('driver.filterbar:reset', function() {
                    scope.ctl.value = [];
                    // This function must update the parent filterbar with the new value; the
                    // filterbar doesn't know what the defaults for each filter should be.
                    scope.ctl.updateFilter();
                    $timeout(function () { selectElem.selectpicker('refresh'); });
                });


                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === scope.ctl.label) {
                        scope.ctl.value = filter.value;
                        // Updating the filterbar is NOT necessary in this case because it is the
                        // filterbar that is dictating this change; it already knows what the value
                        // needs to be, so that just needs to get reflected locally.
                        $timeout(function () { selectElem.selectpicker('refresh'); });
                    }
                });

                init();

                function init() {
                    // use `$timeout` to ensure that the template is rendered before selectpicker logic
                    $timeout(function() {
                        selectElem.selectpicker();
                    });
                }

                // Notify the parent filterbar that we've made an update here.
                function updateFilter() {
                    if (scope.ctl.value && scope.ctl.value.length > 0) {
                        filterbarController.updateFilter(scope.ctl.label, scope.ctl.value);
                    } else {
                        // Expects a false-y value to delete the filter; empty arrays are truth-y
                        filterbarController.updateFilter(scope.ctl.label, false);
                    }
                }
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('qualityField', QualityField);

})();

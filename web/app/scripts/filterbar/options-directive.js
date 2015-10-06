(function () {
    'use strict';

    /* ngInject */
    function OptionsField() {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'options-field'],
            templateUrl: 'scripts/filterbar/options.html',
            controller: 'optionsController',
            scope: {
                data: '=',
                label: '='
            },
            link: function(scope, elem, attrs, ctlArray) {
                var filterbarController = ctlArray[0];

                init();

                function init() {
                    scope.filter = {'_rule_type': 'containment', 'contains': ''};
                }

                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === scope.label) {
                        var tempFilter = filter.value;
                        tempFilter.contains = tempFilter.contains[0];
                        scope.filter = tempFilter;
                    }
                });

                /**
                 * A simple wrapper around driver-filterbar's updateFilter function.
                 *
                 * @param filterLabel {string} label of which field to filter
                 */
                scope.updateFilter = function(filterLabel) {
                    // TODO: Make this directive create an array of vals to check for containment
                    // instead of this annoying hack
                    var filter = angular.copy(scope.filter);
                    filter.contains = [filter.contains];
                    filterbarController.updateFilter(filterLabel, filter);
                };

            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('optionsField', OptionsField);

})();

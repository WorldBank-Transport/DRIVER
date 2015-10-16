(function () {
    'use strict';

    /* ngInject */
    function OptionsField($timeout) {
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
                scope.filter = {};
                var filterbarController = ctlArray[0];

                init();

                function init() {
                }

                $timeout(function() {
                    $('.selectpicker').selectpicker();
                });

                scope.$watch(scope.filter, function(v) { console.log(v); });

                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === scope.label) {
                        var tempFilter = filter.value;
                        scope.filter.contains = tempFilter.contains;
                    }
                });

                /**
                 * A simple wrapper around driver-filterbar's updateFilter function.
                 *
                 * @param filterLabel {string} label of which field to filter
                 */
                scope.updateFilter = function(filterLabel) {
                    // only include filters that actually do something
                    if (scope.filter.contains.length) {
                        // handle syntactic differences necessitated by having related objects
                        if (scope.data.multiple) {
                            // TODO: Implement a filter for related containment in djsonb
                            filterbarController.updateFilter(filterLabel,
                                                             _.merge({'_rule_type': 'related_containment'},
                                                                     scope.filter));
                        } else {
                            filterbarController.updateFilter(filterLabel,
                                                             _.merge({'_rule_type': 'containment'},
                                                                     scope.filter));
                        }
                    } else {
                        filterbarController.updateFilter(filterLabel);  // Delete filter from cache
                    }
                };

            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('optionsField', OptionsField);

})();

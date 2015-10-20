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
                var filterbarController = ctlArray[0];
                var restored;
                init();

                function init() {
                    scope.filter = {contains: []};
                    scope.updateFilter = updateFilter;

                    // Use UUID for ID to track elements
                    scope.domID = guid();
                    restored = false;

                    // use `%timeout` to ensure that the template is rendered before selectpicker logic
                    $timeout(function() { $('#' + scope.domID).selectpicker(); });
                }

                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === scope.label) {
                        if (!restored && filter) {
                            restored = true;
                            scope.filter.contains = filter.value.contains;
                        }
                    }
                });

                // Watch `filter.contains`; ensure that when changes occur, they're set and shown
                scope.$watch('filter.contains', function(contains) {
                    $('#' + scope.domID).val(contains);
                    $timeout(function() { $('#' + scope.domID).selectpicker('refresh'); });
                });

                /**
                 * A simple wrapper around driver-filterbar's updateFilter function.
                 *
                 * @param filterLabel {string} label of which field to filter
                 */
                function updateFilter(filterLabel) {
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
                }

                // Highly optimized elper function to generate UUIDs; taken from:
                // http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
                function guid() {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                    }
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
                }

            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('optionsField', OptionsField);

})();

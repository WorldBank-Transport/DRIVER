(function () {
    'use strict';

    /* ngInject */
    function TextSearchField() {
        var module = {
            restrict: 'A',
            require: ['^driver-filterbar', 'text-search-field'],
            templateUrl: 'scripts/filterbar/text-search.html',
            controller: 'textSearchController',
            link: function(scope, elem, attrs, ctlArray) {
                var filterLabel = '__searchText';
                var filterBarCtl = ctlArray[0];

                scope.$on('driver.filterbar:reset', function() {
                    init();
                });

                // restore previously set filter selection on page reload
                scope.$on('driver.filterbar:restored', function(event, filter) {
                    if (filter.label === filterLabel) {
                        scope.searchText = filter.pattern;
                    }
                });
                scope.$watch('searchText', function() {
                    updateFilter();
                });

                function init() {
                    scope.searchText = '';
                }

                /**
                 * A simple wrapper around driver-filterbar's updateFilter function;
                 *  filters should only be updated when data validates
                 *
                 * @param filterLabel {string} label of which field to filter
                 * @param filterObj {object} filter data
                 */
                function updateFilter() {
                    filterBarCtl.updateFilter(filterLabel, scope.searchText);
                }

                init();
            }
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('textSearchField', TextSearchField);

})();

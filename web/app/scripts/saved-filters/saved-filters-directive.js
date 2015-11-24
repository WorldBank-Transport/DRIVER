(function () {
    'use strict';

    /* ngInject */
    function SavedFilters() {
        var module = {
            restrict: 'EA',
            scope: {
                compact: '='
            },
            templateUrl: 'scripts/saved-filters/saved-filters-partial.html',
            bindToController: true,
            replace: true,
            controller: 'SavedFiltersController',
            controllerAs: 'filters'
        };
        return module;
    }

    angular.module('driver.savedFilters')
    .directive('driverSavedFilters', SavedFilters);

})();

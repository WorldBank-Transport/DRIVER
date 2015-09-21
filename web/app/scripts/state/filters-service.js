/**
 * Record Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function FilterState($log, $rootScope, localStorageService) {
        var svc = this;

        var storageName = 'filterbar.filters';

        svc.restoreFilters = restoreFilters;
        svc.saveFilters = saveFilters;
        svc.clear = clear;

        /**
         * Store current filters, in case of page reload.
         *
         * @param {Object} filters FilterBar's filters object to restore on load.
         */
        function saveFilters(filters) {
            localStorageService.set(storageName, filters);
        }

        // TODO: currently unused
        function clear() {
            localStorageService.remove(storageName);
        }

        /**
         * Broadcast event to trigger setting previously stored filters back on the filter bar.
         */
        function restoreFilters() {
            var filterObj = localStorageService.get(storageName);
            filterObj = !!filterObj ? filterObj : {};

            // if no filters, should set empty object (not null)
            if (!filterObj) {
                filterObj = {};
            }

            $log.debug('Restoring filters:');
            $log.debug(filterObj);

            // tell the filterbar to set the filters back
            $rootScope.$broadcast('driver.filterbar:restore', filterObj);
        }

        return svc;
    }

    angular.module('driver.state')
    .factory('FilterState', FilterState);
})();

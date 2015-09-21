/**
 * Record Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function FilterState($log, $rootScope, localStorageService) {
        var svc = this;
        var oldFilters;

        // API
        svc.restoreFilters = restoreFilters;
        svc.saveFilters = saveFilters;
        svc.get = get;
        svc.clear = clear;

        var storageName = 'filterbar.filters';

        /**
         * Store current filters, in case of page reload.
         *
         * @param {Object} filters FilterBar's filters object to restore on load.
         */
        function saveFilters(filters) {
            localStorageService.set(storageName, filters);
        }


        /**
         * A simple method for returning only the relevant portion of oldFilters
         */
        function get(key) {
            return oldFilters[key] || {};
        }


        function clear() {
            localStorageService.remove(storageName);
        }


        /**
         * Broadcast event to trigger setting previously stored filters back on the filter bar.
         */
        function restoreFilters() {
            var filterString = localStorageService.get(storageName);
            var filterObj = !!filterString ? filterString : {};

            // if no filters, should set empty object (not null)
            if (!filterObj) {
                filterObj = {};
            }
            oldFilters = filterObj;

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

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
        var geoStorageName = 'filterbar.geofilter';

        svc.getFilters = getFilters;
        svc.restoreFilters = restoreFilters;
        svc.saveFilters = saveFilters;
        svc.clear = clear;
        svc.filters = {};

        /**
         * Store current filters, in case of page reload.
         *
         * @param {Object} filters FilterBar's filters object to restore on load.
         * @param {Object} filterGeom GeoJSON boundary to filter by.
         */
        function saveFilters(filters, filterGeom) {
            svc.filters = filters;
            localStorageService.set(storageName, filters);
            localStorageService.set(geoStorageName, filterGeom);
        }

        // TODO: currently unused
        function clear() {
            localStorageService.remove(storageName);
            localStorageService.remove(geoStorageName);
        }

        /**
         * Ask filter bar to send the currently set filters.
         */
        function getFilters() {
            $rootScope.$broadcast('driver.filterbar:send');
        }

        /**
         * Broadcast event to trigger setting previously stored filters back on the filter bar.
         */
        function restoreFilters() {
            var filterObj = localStorageService.get(storageName);
            filterObj = !!filterObj ? filterObj : {};

            var geoFilterObj = localStorageService.get(geoFilterObj);
            geoFilterObj = !!geoFilterObj ? geoFilterObj : null;

            $log.debug('Restoring filters:');
            $log.debug([filterObj, geoFilterObj]);

            // tell the filterbar to set the filters back
            $rootScope.$broadcast('driver.filterbar:restore', [filterObj, geoFilterObj]);
            svc.filters = filterObj;
        }

        return svc;
    }

    angular.module('driver.state')
    .factory('FilterState', FilterState);
})();

/**
 * Record Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function FilterState($log, $rootScope, debounce, localStorageService) {
        var svc = this;

        var storageName = 'filterbar.filters';
        var geoStorageName = 'filterbar.geofilter';

        var filtersRestored = false;

        svc.getFilters = getFilters;
        svc.restoreFilters = restoreFilters;

        // Need to debounce saveFilters, because it is called many times when the filters
        // are being initialized, and we only want the final one to take effect.
        svc.saveFilters = debounce(saveFilters, 500);
        svc.reset = reset;
        svc.filters = {};

        /**
         * Store current filters, in case of page reload.
         *
         * @param {Object} filters FilterBar's filters object to restore on load.
         * @param {Object} filterGeom GeoJSON boundary to filter by.
         */
        function saveFilters(filters, filterGeom) {
            // Don't allow saving filters until they're restored.
            // Otherwise the saved state gets lost while loading.
            if (!filtersRestored) {
                return;
            }

            svc.filters = filters;
            localStorageService.set(storageName, filters);
            if (filterGeom) {
                localStorageService.set(geoStorageName, filterGeom);
            }
        }

        /**
         * Set the filterbar to its initial state
         */
        function reset() {
            localStorageService.remove(storageName);
            localStorageService.remove(geoStorageName);
            svc.filters = {};
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
        function restoreFilters(filterObj) {
            if(!filterObj) {
                filterObj = localStorageService.get(storageName);
                filterObj = !!filterObj ? filterObj : {};
            }

            var geoFilterObj = localStorageService.get(geoFilterObj);
            geoFilterObj = !!geoFilterObj ? geoFilterObj : null;

            $log.debug('Restoring filters:');
            $log.debug([filterObj, geoFilterObj]);

            // tell the filterbar to set the filters back
            $rootScope.$broadcast('driver.filterbar:restore', [filterObj, geoFilterObj]);
            svc.filters = filterObj;

            filtersRestored = true;
        }

        return svc;
    }

    angular.module('driver.state')
    .factory('FilterState', FilterState);
})();

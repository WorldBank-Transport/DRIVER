/**
 * Record Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function FilterState($rootScope, debounce, localStorageService, WebConfig) {
        var svc = this;

        var storageName = 'filterbar.filters';
        var geoStorageName = 'filterbar.geofilter';

        var filtersRestored = false;

        svc.getFilters = getFilters;
        svc.restoreFilters = restoreFilters;
        svc.getDateFilter = getDateFilter;
        svc.getCreatedFilter = getCreatedFilter;
        svc.getCreatedByFilter = getCreatedByFilter;
        svc.getWeatherFilter = getWeatherFilter;
        svc.getQualityChecksFilter = getQualityChecksFilter;
        svc.getNonJsonFilterNames = getNonJsonFilterNames;

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
         * Broadcast event to trigger setting previously stored filters
         * back on the filter bar.
         */
        function restoreFilters(filterObj) {
            if(!filterObj) {
                filterObj = localStorageService.get(storageName);
                filterObj = !!filterObj ? filterObj : {};
            }

            var geoFilterObj = localStorageService.get(geoFilterObj);
            geoFilterObj = !!geoFilterObj ? geoFilterObj : null;

            // tell the filterbar to set the filters back
            $rootScope.$broadcast('driver.filterbar:restore', [filterObj, geoFilterObj]);
            svc.filters = filterObj;

            filtersRestored = true;
        }

        /*
         * returns an object containing the min and max dates
         * If none are set, uses passed in defaults or its own
         */
        function getGenericDateFilter(label, defaults) {
            // An exceptional case for date ranges (not part of the JsonB we filter over).
            // If no dates are specified, the last 90 days are used.
            var now = new Date();
            var duration = moment.duration({ days:90 });
            var maxDateString = now.toJSON().slice(0, 10);
            var minDateString = new Date(now - duration).toJSON().slice(0, 10);
            var dateFilters = {};
            if(defaults){
                maxDateString = defaults.maxDate ? defaults.maxDate : maxDateString;
                minDateString = defaults.minDate ? defaults.minDate : minDateString;
            }

            if (svc.filters && svc.filters.hasOwnProperty(label)) {
                minDateString = convertDT(svc.filters[label].min || minDateString);
                maxDateString = convertDT(svc.filters[label].max || maxDateString);
            }

            // Perform some sanity checks on the dates
            if (minDateString) {
                var min = moment.tz(minDateString + ' 00:00:00', WebConfig.localization.timeZone);
                if (!isNaN(min.unix())) {
                    dateFilters.minDate = min.toISOString();
                }
            }
            if (maxDateString) {
                var max = moment.tz(maxDateString + ' 23:59:59', WebConfig.localization.timeZone);
                if (!isNaN(max.unix())) {
                    dateFilters.maxDate = max.toISOString();
                }
            }
            return dateFilters;
        }

        function getDateFilter(defaults) {
            return getGenericDateFilter('__dateRange', defaults);
        }

        function getCreatedFilter(defaults) {
            return getGenericDateFilter('__createdRange', defaults);
        }

        function getCreatedByFilter() {
            return svc.filters.__createdBy;
        }

        function getWeatherFilter() {
            return svc.filters.__weather;
        }
        function getQualityChecksFilter() {
            var qualityChecks = {};
            _.forEach(svc.filters.__quality, function(checkKey) {
                qualityChecks[checkKey] = true;
            });
            return qualityChecks;
        }

        function getNonJsonFilterNames() {
            return [
                '__dateRange',
                '__createdRange',
                '__searchText',
                '__createdBy',
                '__quality',
                '__weather'
            ];
        }

        // Helper for converting a datetime string to the proper format to work with moment.tz.
        // A datetime in the format MM/DD/YYYY doesn't work properly with with moment tz conversion,
        // and must be converted to YYYY-MM-DD
        function convertDT(dtString) {
            // If empty, return null, we don't want it on the query
            if (!dtString) {
                return null;
            }

            // If it's already in the right format, don't do the conversion
            if (dtString.indexOf('/') <= 0) {
                return dtString;
            }

            var components = dtString.split('/');
            var month = components[0];
            var day = components[1];
            var year = components[2];
            return year + '-' + month + '-' + day;
        }

        return svc;
    }

    angular.module('driver.state')
    .factory('FilterState', FilterState);
})();

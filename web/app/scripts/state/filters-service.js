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
            // By default, filter for the past 90 days
            var duration = moment.duration({ days:90 });
            var maxDate = new Date();
            var minDate = new Date(maxDate - duration);

            if(defaults){
                // Defaults are in UTC but represent their desired date in the server timezone, so
                //  we don't need to do any parsing to get them to point to the correct calendar
                //  date in server time.
                maxDate = defaults.maxDate || maxDate;
                minDate = defaults.minDate || minDate;
            }
            if (svc.filters && svc.filters.hasOwnProperty(label)) {
                // The date filter gives date strings that represent 00:00 local midnight of the
                //  chosen day, in UTC. This means for locations with a positive UTC offset, the
                //  date in the string will not match the date the user chose (00:00 Monday in
                //  UTC+1 becomes 23:00 Sunday in UTC+0).
                // Take the UTC-formatted date, have Moment parse it into the user's local timezone,
                //  and format to extract the bare calendar date.
                maxDate = moment(svc.filters[label].max).format('YYYY-MM-DD');
                minDate = moment(svc.filters[label].min).format('YYYY-MM-DD');
            }

            // Perform some sanity checks on the dates
            var dateFilters = {};
            if (minDate) {
                // Convert the date into the server's timezone and get midnight that day's morning
                var min = moment.tz(minDate, WebConfig.localization.timeZone).startOf('day');
                if (!isNaN(min.unix())) {
                    dateFilters.minDate = min.toISOString();
                }
            }
            if (maxDate) {
                // Convert the date into the server's timezone and get midnight that day's night
                var max = moment.tz(maxDate, WebConfig.localization.timeZone).endOf('day');
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
                '__createdBy',
                '__quality',
                '__weather'
            ];
        }

        return svc;
    }

    angular.module('driver.state')
    .factory('FilterState', FilterState);
})();

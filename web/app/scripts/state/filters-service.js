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

        /**
         * Store current filters, in case of page reload.
         *
         * @param {Object} filters FilterBar's filters object to restore on load.
         */
        svc.saveFilters = function(filters) {
            localStorageService.set(storageName, JSON.stringify(filters));
        };

        /**
         * Broadcast event to trigger setting previously stored filters back on the filter bar.
         */
        svc.restoreFilters = function() {
            var filterString = localStorageService.get(storageName);
            var filterObj = JSON.parse(filterString);

            // if no filters, should set empty object (not null)
            if (!filterObj) {
                filterObj = {};
            }

            $log.debug('Restoring filters:');
            $log.debug(filterObj);

            // tell the filterbar to set the filters back
            $rootScope.$broadcast('driver.filterbar:restore', filterObj);
        };


        return svc;
    }

    angular.module('driver.state')
    .factory('FilterState', FilterState);
})();

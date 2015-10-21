/**
 * Record Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function RecordState($log, $rootScope, $q, QueryBuilder) {
        var records,
            lastDoFilter,
            lastOffset,
            lastExtraParams;

        var svc = {
            getRecords: getRecords
        };
        return svc;

        /**
         * Take a series of parameters (the params consumed by the QueryBuilder that this function
         *  wraps) and do a little work to ensure that duplicate requests aren't getting sent out
         */
        function getRecords(doFilter, offset, extraParams, force) {
            // Standardize to avoid js equality checking weirdness
            doFilter = doFilter || false;
            offset = offset || 0;
            extraParams = extraParams || {};

            // Fresh request if `force`
            if (force) { records = null; }

            if (records) { // If we have records already
                // If parameters differ from the last call
                if (doFilter !== lastDoFilter || offset !== lastOffset || !_.isEqual(extraParams, lastExtraParams)) {
                    records = QueryBuilder.djangoQuery(doFilter, offset, extraParams);
                } else { // If parameters do not differ
                    $log.debug('Saved a `Record` request');
                }
            } else { // If no records found
                records = QueryBuilder.djangoQuery(doFilter, offset, extraParams);
            }

            // Store current parameters to check if a new request is necessary in a future request
            lastDoFilter = doFilter;
            lastOffset = offset;
            lastExtraParams = extraParams;
            return records;
        }
    }

    angular.module('driver.state')
    .factory('RecordState', RecordState);
})();

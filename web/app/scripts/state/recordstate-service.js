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

        function getRecords(doFilter, offset, extraParams, force) {
            // Fresh request if `force`
            if (force) { records = null; }

            if (records) { // If we have records already
                if (doFilter !== lastDoFilter || offset !== lastOffset || extraParams !== lastExtraParams) {
                    records = QueryBuilder.djangoQuery(doFilter, offset, extraParams);
                } // If parameters differ from the last call
                $log.debug('saved a request');
            } else { // If no records found
                records = QueryBuilder.djangoQuery(doFilter, offset, extraParams);
            }

            return records;
        }
    }

    angular.module('driver.state')
    .factory('RecordState', RecordState);
})();

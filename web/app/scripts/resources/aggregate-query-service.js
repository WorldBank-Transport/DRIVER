/**
 * This Service provides a centralized location to handle aggregate data - sums, percentages, etc.
 */
(function () {
    'use strict';

    /* ngInject */
    function RecordAggregates($q, RecordTypes, RecordState, Records, QueryBuilder) {
        var svc = {
            recentCounts: recentCounts,
            toddow: toddow
        };
        return svc;

        /**
         * Retrieve TODDOW data - API mirroring the query builder service
         */
        function toddow(doFilter, extraParams) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            doFilter = doFilter || true;
            QueryBuilder.assembleParams(doFilter, 0).then(function(params) {  // 0 for offset
                Records.toddow(_.extend(params, extraParams)).$promise.then(function(toddowData) {
                    deferred.resolve(toddowData);
                });
            });
            return deferred.promise;
        }

        /**
         * Request the most recent 30, 90, 365 day counts for the currently selected record type
         */
        function recentCounts() {
            var deferred = $q.defer();
            // Record Type
            RecordState.getSelected().then(function(selected) {
                var uuid = selected.uuid;
                RecordTypes.recentCounts({id: uuid}).$promise.then(function(counts) {
                    deferred.resolve(counts);
                });
            });
            /* jshint camelcase: true */
            return deferred.promise;
        }
    }

    angular.module('driver.resources')
    .factory('RecordAggregates', RecordAggregates);

})();

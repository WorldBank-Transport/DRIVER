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
            doFilter = doFilter === undefined ? true : doFilter;
            QueryBuilder.assembleParams(doFilter, 0).then(function(params) {  // 0 for offset
                // toddow should never use a limit
                params = _.extend(params, extraParams);
                if (params.limit) {
                    delete params.limit;
                }

                Records.toddow(params).$promise.then(function(toddowData) {
                    deferred.resolve(toddowData);
                });
            });
            return deferred.promise;
        }

        /**
         * Request the most recent 30, 90, 365 day counts for the currently selected record type
         */
        function recentCounts(boundaryId) {
            var deferred = $q.defer();
            // Record Type
            RecordState.getSelected().then(function(selected) {
                var uuid = selected.uuid;
                var params = { id: uuid };
                if (boundaryId) {
                    /* jshint camelcase: false */
                    params.polygon_id = boundaryId;
                    /* jshint camelcase: true */
                }

                RecordTypes.recentCounts(params).$promise.then(function(counts) {
                    deferred.resolve(counts);
                });
            });
            return deferred.promise;
        }
    }

    angular.module('driver.resources')
    .factory('RecordAggregates', RecordAggregates);

})();

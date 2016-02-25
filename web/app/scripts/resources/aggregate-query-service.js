/**
 * This Service provides a centralized location to handle aggregate data - sums, percentages, etc.
 */
(function () {
    'use strict';

    /* ngInject */
    function RecordAggregates($q, RecordTypes, RecordState, Records, QueryBuilder) {
        var svc = {
            recentCounts: recentCounts,
            toddow: toddow,
            stepwise: stepwise
        };
        return svc;

        /**
         * Retrieve TODDOW data - API mirroring the query builder service
         */
        function toddow(extraParams, doAttrFilters, doJsonFilters) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            doAttrFilters = doAttrFilters !== false;
            doJsonFilters = doJsonFilters !== false;
            QueryBuilder.assembleParams(0, doAttrFilters, doJsonFilters, true).then( // 0 for offset
                function(params) {
                    // toddow should never use a limit
                    params = _.extend(params, extraParams);
                    if (params.limit) {
                        delete params.limit;
                    }

                    Records.toddow(params).$promise.then(function(toddowData) {
                        deferred.resolve(toddowData);
                    });
                }
            );
            return deferred.promise;
        }

        /**
         * Retrieve stepwise data - API mirroring the query builder service
         */
        function stepwise(extraParams, doAttrFilters, doJsonFilters) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            doAttrFilters = doAttrFilters !== false;
            doJsonFilters = doJsonFilters !== false;
            QueryBuilder.assembleParams(0, doAttrFilters, doJsonFilters, true).then( // 0 for offset
                function(params) {
                // stepwise should never use a limit
                params = _.extend(params, extraParams);
                if (params.limit) {
                    delete params.limit;
                }

                Records.stepwise(params).$promise.then(function(stepwiseData) {
                    deferred.resolve(stepwiseData);
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

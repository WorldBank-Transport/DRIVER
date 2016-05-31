/**
 * This Service provides a centralized location to handle aggregate data - sums, percentages, etc.
 */
(function () {
    'use strict';

    /* ngInject */
    function RecordAggregates($q, RecordTypes, RecordState, Records, QueryBuilder) {
        var svc = {
            recentCounts: recentCounts,
            socialCosts: socialCosts,
            toddow: toddow,
            stepwise: stepwise
        };
        return svc;

        /**
         * Retrieve TODDOW data - API mirroring the query builder service
         */
        function toddow(extraParams, filterConfig) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            filterConfig = filterConfig || {};
            QueryBuilder.assembleParams(0, filterConfig, true).then( // 0 for offset
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
        function stepwise(extraParams, filterConfig) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            filterConfig = filterConfig || {};
            QueryBuilder.assembleParams(0, filterConfig, true).then( // 0 for offset
                function(params) {
                    // stepwise should never use a limit
                    params = _.extend(params, extraParams);
                    if (params.limit) {
                        delete params.limit;
                    }

                    Records.stepwise(params).$promise.then(function(stepwiseData) {
                        deferred.resolve(stepwiseData);
                    });
                }
            );
            return deferred.promise;
        }

        /**
         * Request the most recent 30, 90, 365 day counts for the currently selected record type
         */
        function recentCounts() {
            var deferred = $q.defer();
            var filterConfig = { doAttrFilters: false,
                                 doBoundaryFilter: true,
                                 doJsonFilters: false, };
            QueryBuilder.assembleParams(0, filterConfig, true).then(
                function (params) {
                    if (params.limit) {
                       delete params.limit;
                    }

                    Records.recentCounts(params).$promise.then(function(counts) {
                        deferred.resolve(counts);
                    });
                }
            );
            return deferred.promise;
        }
        /**
         * Request the social costs (if configured) for the currently selected record type
         */
        function socialCosts(extraParams, filterConfig) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            filterConfig = filterConfig || {};
            QueryBuilder.assembleParams(0, filterConfig, true).then(
                function (params) {
                    params = _.extend(params, extraParams);
                    if (params.limit) {
                       delete params.limit;
                    }

                    Records.socialCosts(params).$promise.then(
                        function(costs) {
                            deferred.resolve(costs);
                        },
                        function(error) {
                            deferred.reject({'error': error});
                        }
                    );
                }
            );
            return deferred.promise;
        }
    }

    angular.module('driver.resources')
    .factory('RecordAggregates', RecordAggregates);

})();

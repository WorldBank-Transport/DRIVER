/**
 * This Service provides a centralized location to handle construction of queries that involve
 *  the many (sometimes complex) filters that DRIVER requires for dates, spaces, and jsonb.
 *  At root, there are two functions: `djangoQuery` and `windshaftQuery`. Each of these share
 *  a function, `assembleParams` which is a promise-based function in which all of the relevant
 *  information for making a query is gathered together into a flattened object.
 */
(function () {
    'use strict';

    /* ngInject */
    function QueryBuilder($q, FilterState, RecordState, Records) {
        var svc = this;
        svc.djangoQuery = djangoQuery;
        svc.unfilteredDjangoQuery = function(offset) { return djangoQuery(offset, false); };
        svc.windshaftQuery = windshaftQuery;
        svc.unfilteredWindshaftQuery = function() { return windshaftQuery(false); };
        svc.assembleParams = assembleParams;


        /**
         * This function takes two (optional) arguments, compiles a query, and carries out the
         *  corresponding request for filtering django records.
         *
         * @param {number} offset The page in django's pagination to return
         * @param {bool} doFilter If true: filter results
         */
        function djangoQuery(offset, doFilter) {
            var deferred = $q.defer();
            doFilter = doFilter !== undefined ? doFilter : true;
            assembleParams(doFilter, offset).then(function(params) {
                Records.get(params).$promise.then(function(records) {
                    deferred.resolve(records);
                });
            });
            return deferred.promise;
        }

        /**
         * This function takes two (optional) arguments, compiles a query, and carries out the
         *  corresponding request for filtering windshaft results.
         *
         * @param {bool} doFilter If true: filter results
         */
        function windshaftQuery(doFilter) {
            var deferred = $q.defer();
            doFilter = doFilter !== undefined ? doFilter : true;
            assembleParams(doFilter).then(function(params) {
                Records.get(params).$promise.then(function(records) {
                    deferred.resolve(records);
                });
            });
            return deferred.promise;
        }

        function assembleParams(doFilter, offset) {
            var deferred = $q.defer();
            var paramObj = {};
            /* jshint camelcase: false */
            if (doFilter) {
                // An exceptional case for date ranges (not part of the JsonB we filter over)
                if (FilterState.filters.hasOwnProperty('__dateRange')) {
                    if (FilterState.filters.__dateRange.hasOwnProperty('min')) {
                        var minDate = new Date(FilterState.filters.__dateRange.min);
                        paramObj.occurred_min = minDate.toISOString();
                    }
                    if (FilterState.filters.__dateRange.hasOwnProperty('min')) {
                        var maxDate = new Date(FilterState.filters.__dateRange.max);
                        paramObj.occurred_max = maxDate.toISOString();
                    }
                }
            }

            // Pagination offset
            if (offset) {
                paramObj.offset = offset;
            }

            // Record Type
            RecordState.getSelected().then(function(selected) {
                paramObj.record_type = selected.uuid;
                deferred.resolve(paramObj);
            });
            /* jshint camelcase: true */
            return deferred.promise;
        }

        return svc;
    }

    angular.module('driver.resources')
    .factory('QueryBuilder', QueryBuilder);

})();

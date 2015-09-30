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

        function windshaftQuery(doFilter) {
            doFilter = doFilter !== undefined ? doFilter : true;
            assembleParams(doFilter).then(function(params) {
                Records.get(params);
            });
        }

        function assembleParams(doFilter, offset) {
            var deferred = $q.defer();
            var paramObj = {};
            /* jshint camelcase: false */
            if (doFilter) {
                if ('__dateRange' in FilterState.filters) {
                    if ('min' in FilterState.filters.__dateRange) {
                        var minDate = new Date(FilterState.filters.__dateRange.min);
                        paramObj.occurred_min = minDate.toISOString();
                    }
                    if ('max' in FilterState.filters.__dateRange) {
                        var maxDate = new Date(FilterState.filters.__dateRange.max);
                        paramObj.occurred_max = maxDate.toISOString();
                    }
                }
            }

            // Pagination offset
            if (offset) {
                paramObj.offset = offset;
            }

            // Record Type and offset
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

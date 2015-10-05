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
        svc.unfilteredDjangoQuery = function(extraParams, offset) {
            return djangoQuery(extraParams, offset, false);
        };
        svc.windshaftQuery = windshaftQuery;
        svc.unfilteredWindshaftQuery = function() { return windshaftQuery({}, false); };
        svc.assembleParams = assembleParams;


        /**
         * This function takes two (optional) arguments, compiles a query, and carries out the
         *  corresponding request for filtering django records.
         *
         * @param {number} offset The page in django's pagination to return
         * @param {bool} doFilter If true: filter results
         */
        function djangoQuery(extraParams, offset, doFilter) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            doFilter = doFilter || true;
            assembleParams(doFilter, offset).then(function(params) {
                Records.get(_.extend(params, extraParams)).$promise.then(function(records) {
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
        function windshaftQuery(extraParams, doFilter) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            doFilter = doFilter || true;
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
            console.log(FilterState.filters);
            if (doFilter) {
                // An exceptional case for date ranges (not part of the JsonB we filter over)
                if (FilterState.filters.hasOwnProperty('__dateRange')) {
                    if (FilterState.filters.__dateRange.hasOwnProperty('min')) {
                        var minDate = new Date(FilterState.filters.__dateRange.min);
                        paramObj.occurred_min = minDate.toISOString();
                    }
                    if (FilterState.filters.__dateRange.hasOwnProperty('max')) {
                        var maxDate = new Date(FilterState.filters.__dateRange.max);
                        paramObj.occurred_max = maxDate.toISOString();
                    }
                }

                var jsonFilters = {};
                _.each(_.omit(FilterState.filters, '__dateRange'), function(filter, path) {
                    jsonFilters = _.merge(jsonFilters, expandFilter(path.split('#'), filter));
                });

                // Handle cases where no json filters are set
                if (!_.isEmpty(jsonFilters)) {
                    paramObj = _.extend(paramObj, {'jsonb': jsonFilters});
                }
            }

            // Pagination offset
            if (offset) {
                paramObj.offset = offset;
            }

            console.log(paramObj);
            // Record Type
            RecordState.getSelected().then(function(selected) {
                paramObj.record_type = selected.uuid;
                deferred.resolve(paramObj);
            });
            /* jshint camelcase: true */
            return deferred.promise;
        }

        function expandFilter(path, filter, memo) {
            memo = memo || {};
            if (path.length === 1) {
                memo[path[0]] = filter;
                return memo;
            }

            memo[path[0]] = expandFilter(_.tail(path), filter);
            return memo;

        }


        return svc;
    }

    angular.module('driver.resources')
    .factory('QueryBuilder', QueryBuilder);

})();

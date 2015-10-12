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
        var svc = {
            djangoQuery: djangoQuery,
            unfilteredDjangoQuery: function(offset, extraParams) {
                return djangoQuery(false, offset, extraParams);
            },
            windshaftQuery: windshaftQuery,
            unfilteredWindshaftQuery: function() { return windshaftQuery({}, false); },
            // KEEP THESE AVAILABLE FOR TESTING
            assembleParams: assembleParams,
            assembleJsonFilterParams: assembleJsonFilterParams
        };
        return svc;


        /**
         * This function takes two (optional) arguments, compiles a query, and carries out the
         *  corresponding request for filtering django records.
         *
         * @param {bool} doFilter If true: Generate a filter from FilterState service.
         * @param {number} offset The page in django's pagination to return
         * @param {object} extraParams an object whose properties are extra parameters
         *                             not otherwise configured. Can include extra filters here
         *                             that will be included along with those from FilterState,
         *                             or used independently if doFilter is false.
         */
        function djangoQuery(doFilter, offset, extraParams) {
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
        function windshaftQuery(doFilter, extraParams) {
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

        /**
         * A utility function for constructing a single object for jsonb query filtering
         *
         * @param {object} filters The filters as stored inside DRIVER logic and, in particular,
         *                         by the filter service - transformed to produce a query string
         */
        function assembleJsonFilterParams(filters) {
            var filterParams = {};
            _.each(filters, function(filter, path) {
                filterParams = _.merge(filterParams, expandFilter(path.split('#'), filter));
            });
            return filterParams;
        }

        /**
         * Assemble all query parameters into a single query parameters object for the Record resource
         *
         * @param {bool} doFilter Whether or not to include filters in this query at all (still do
         *                        offsets and record_type filtering, however)
         * @param {number} offset The offset to use for pagination of results
         *
         */
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
                    if (FilterState.filters.__dateRange.hasOwnProperty('max')) {
                        var maxDate = new Date(FilterState.filters.__dateRange.max);
                        paramObj.occurred_max = maxDate.toISOString();
                    }
                }

                var jsonFilters = svc.assembleJsonFilterParams(_.omit(FilterState.filters, '__dateRange'));

                // Handle cases where no json filters are set
                if (!_.isEmpty(jsonFilters)) {
                    paramObj = _.extend(paramObj, {'jsonb': jsonFilters});
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

        /**
         * Recurses through a list of edge names and constructs an object graph which corresponds
         *  to that list.
         *  E.G. (['a', 'b', 'c'], <filter>) would be {'a': {'b': {'c': <filter> }}}
         *
         * @param {array} path A list of edge names
         * @param {object} filter The filter that should sit at the endnode of the constructed graph
         */
        function expandFilter(path, filter) {
            var expanded = {};
            if (path.length === 1) {
                expanded[path[0]] = filter;
                return expanded;
            }

            expanded[path[0]] = expandFilter(_.tail(path), filter);
            return expanded;

        }
    }

    angular.module('driver.resources')
    .factory('QueryBuilder', QueryBuilder);

})();

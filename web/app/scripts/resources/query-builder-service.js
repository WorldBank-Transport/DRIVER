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
    function QueryBuilder($q, FilterState, RecordState, RecordSchemaState, Records, WebConfig) {
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
        function assembleJsonFilterParams(filterSpecs) {
            var deferred = $q.defer();
            // Remove unused filters
            var searchText = filterSpecs.__searchText;
            var filters = _.cloneDeep(_.omit(filterSpecs, '__searchText'));
            _.each(filters, function(filter, path) {
                if (filter.contains && !filter.contains.length) { delete filters[path]; }
            });

            RecordSchemaState.getFilterables().then(function(filterables) {
                // Delete the extraneous parts of 'filterables'
                _.each(filters, function(filter, key) { delete filterables[key]; });
                _.each(filterables, function(filterable, key) {
                    if (filterable.fieldType !== 'selectlist') {
                        delete filterables[key];
                    } else {
                        filterables[key] = {};
                        filterables[key].pattern = searchText;  // Add searchText
                        // Djsonb needs to know if we're dealing with single or multiple fields
                        /* jshint camelcase: false */
                        if (filterable.multiple) {
                            filterables[key]._rule_type = 'containment_multiple';
                        } else {
                            filterables[key]._rule_type = 'containment';
                        }
                        /* jshint camelcase: true */
                    }
                });

                // If searchtext, add specifications to tree
                if (searchText) { filters = _.merge(filters, filterables); }

                // The final filter object
                var filterParams = {};
                _.each(filters, function(filter, path) {
                    filterParams = _.merge(filterParams, expandFilter(path.split('#'), filter));
                });

                deferred.resolve(filterParams);
            });
            return deferred.promise;
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
            var jsonFilters; // For dealing with promise
            /* jshint camelcase: false */
            if (doFilter) {
                // An exceptional case for date ranges (not part of the JsonB we filter over).
                // If no dates are specified, the last 90 days are used.
                var now = new Date();
                var duration = moment.duration({ days:90 });
                var maxDateString = now.toJSON().slice(0, 10);
                var minDateString = new Date(now - duration).toJSON().slice(0, 10);

                // Add date range parameters
                if (FilterState.filters.hasOwnProperty('__dateRange')) {
                    minDateString = FilterState.filters.__dateRange.min || minDateString;
                    maxDateString = FilterState.filters.__dateRange.max || maxDateString;
                }

                // Perform some sanity checks on the dates
                var min = new Date(minDateString);
                if (!isNaN(min.getTime())) {
                    paramObj.occurred_min = min.toISOString();
                }
                var max = new Date(maxDateString + ' 23:59:59');
                if (!isNaN(max.getTime())) {
                    paramObj.occurred_max = max.toISOString();
                }

                svc.assembleJsonFilterParams(_.omit(FilterState.filters, '__dateRange')).then(function(filts) {
                    jsonFilters = filts;
                    // Handle cases where no json filters are set
                    if (!_.isEmpty(jsonFilters)) {
                        paramObj = _.extend(paramObj, { jsonb: jsonFilters });
                    }
                    paramObj.limit = WebConfig.record.limit;
                });
            }

            // Pagination offset
            if (offset) {
                paramObj.offset = offset;
            }

            // Record Type
            $q.all([RecordState.getSelected(), $q.when(jsonFilters)]).then(function(selected) {
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

/**
 * This Service provides a centralized location to handle construction of queries that involve
 *  the many (sometimes complex) filters that DRIVER requires for dates, spaces, and jsonb.
 *  `assembleParams` is a promise-based function in which all of the relevant
 *  information for making a query is gathered together into a flattened object.
 */
(function () {
    'use strict';

    /* ngInject */
    function QueryBuilder($q, FilterState, RecordState, RecordSchemaState, Records, WebConfig) {
        var svc = {
            djangoQuery: djangoQuery,
            unfilteredDjangoQuery: function(offset, extraParams) {
                return djangoQuery(offset, extraParams, false, false);
            },
            // KEEP THESE AVAILABLE FOR TESTING
            assembleParams: assembleParams,
            assembleJsonFilterParams: assembleJsonFilterParams
        };
        return svc;


        /**
         * This function takes two (optional) arguments, compiles a query, and carries out the
         *  corresponding request for filtering django records.
         *
         * @param {number} offset The page in django's pagination to return
         * @param {object} extraParams an object whose properties are extra parameters
         *                             not otherwise configured. Can include extra filters here
         *                             that will be included along with those from FilterState,
         *                             or used independently if the do*Filters params are false.
         * @param {bool} doAttrFilters If true: Generate a filter on record attributes (e.g. date)
                                       from FilterState service.
         * @param {bool} doJsonFilters If true: Generate a filter on record data (i.e. jsonb fields)
                                       from FilterState service.
         */
        function djangoQuery(offset, extraParams, doAttrFilters, doJsonFilters) {
            var deferred = $q.defer();
            extraParams = extraParams || {};
            // Default to applying filters
            doAttrFilters = doAttrFilters !== false;
            doJsonFilters = doJsonFilters !== false;
            assembleParams(offset, doAttrFilters, doJsonFilters).then(function(params) {
                Records.get(_.extend(params, extraParams)).$promise.then(function(records) {
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
                    if (filterable.fieldType !== 'selectlist' && filterable.fieldType !== 'text') {
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
         * Offset and record type filters are applied regardless of do*Filters settings.
         *
         * @param {number} offset The offset to use for pagination of results
         * @param {bool} doAttrFilters Whether or not to include filters on record attributes
         * @param {bool} doJsonFilters Whether or not to include filters on record data (jsonb fields)
         *
         */
        function assembleParams(offset, doAttrFilters, doJsonFilters) {
            var deferred = $q.defer();
            var paramObj = { limit: WebConfig.record.limit };
            var p1;
            /* jshint camelcase: false */
            if (doAttrFilters) {
                var dateFilter = FilterState.getDateFilter();
                paramObj = _.extend(paramObj, {
                    occurred_max: dateFilter.maxDate,
                    occurred_min: dateFilter.minDate
                });
            }

            if (doJsonFilters) {
                p1 = svc.assembleJsonFilterParams(_.omit(FilterState.filters, '__dateRange')).then(
                    function(jsonFilters) {
                        // Handle cases where no json filters are set
                        if (!_.isEmpty(jsonFilters)) {
                            paramObj = _.extend(paramObj, { jsonb: jsonFilters });
                        }
                    }
                );
            }

            $q.when(p1).then(function() {
                // Pagination offset
                if (offset) {
                    paramObj.offset = offset;
                }

                // Record Type
                RecordState.getSelected().then(function(selected) {
                    paramObj.record_type = selected.uuid;
                    deferred.resolve(paramObj);
                });
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

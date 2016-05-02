(function () {
    'use strict';

    /* Builds a list of available aggregations for the rows and columns of custom reports.
     *
     * The time-related options (type: `Time`) are constant.
     * The list is further populated with all available filterable types (type: `Filter`)
     * and all available geographies (type: `Geography`).
     */

    /* ngInject */
    function AggregationsConfig($translate, $q, RecordState, RecordSchemaState, GeographyState) {
        // Translation strings need to wait for the translations file to be available
        // before performing instant translations.
        var timeType;
        var geographyType;
        var filterType;
        var aggregations;

        var initialized = false;

        var svc = {
            getOptions: getOptions
        };
        return svc;

        /* Gets the available geographies and schema filters and loads them into the list.
         * Uses $q.all() since those two queries are independent.
         */
        function getOptions() {
            if (initialized) {
                return $q.resolve(aggregations);
            } else {
                var filtersPromise = RecordState.getSelected().then(function (recordType) {
                    /* jshint camelcase: false */
                    return RecordSchemaState.get(recordType.current_schema);
                    /* jshint camelcase: false */
                });
                var promises = [filtersPromise, GeographyState.getOptions(), $translate.onReady()];
                return $q.all(promises).then(function (data) {
                    var schema = data[0];
                    var geographies = data[1];

                    timeType = $translate.instant('AGG.TIME');
                    geographyType = $translate.instant('AGG.GEOGRAPHY');
                    filterType = $translate.instant('AGG.FILTER');
                    aggregations = [
                        {
                            label: $translate.instant('AGG.YEAR'),
                            value: 'year',
                            type: timeType
                        },
                        {
                            label: $translate.instant('AGG.MONTH'),
                            value: 'month',
                            type: timeType
                        },
                        {
                            label: $translate.instant('AGG.WEEK'),
                            value: 'week',
                            type: timeType
                        },
                        {
                            label: $translate.instant('AGG.DAY'),
                            value: 'day',
                            type: timeType
                        },
                        {
                            label: $translate.instant('AGG.MONTH_OF_YEAR'),
                            value: 'month_of_year',
                            type: timeType
                        },
                        {
                            label: $translate.instant('AGG.WEEK_OF_YEAR'),
                            value: 'week_of_year',
                            type: timeType
                        },
                        {
                            label: $translate.instant('AGG.DAY_OF_MONTH'),
                            value: 'day_of_month',
                            type: timeType
                        },
                        {
                            label: $translate.instant('AGG.DAY_OF_WEEK'),
                            value: 'day_of_week',
                            type: timeType
                        },
                        {
                            label: $translate.instant('AGG.HOUR_OF_DAY'),
                            value: 'hour_of_day',
                            type: timeType
                        }
                    ];

                    loadFilters(schema);
                    loadGeographies(geographies);
                    return aggregations;
                }).then(function(aggregations) {
                    initialized = true;
                    return aggregations;
                });
            }
        }

        /**
         * We can only aggregate on enumerated properties. Loops through the schema (at the
         * definition#property level, not recursively) and adds filters for each
         * enumerated property it finds.
         *
         * TODO:  add " || property.format === 'number'" to the condition to enable aggregating
         * numerical properties if/when that's implemented on the back end.
         */
        function loadFilters(schema) {
            _.forEach(schema.schema.definitions, function(definition, defName) {
                _.forEach(definition.properties, function(property, propName) {
                    if (property.fieldType === 'selectlist') {
                        var aggregationValues = [defName, 'properties', propName];

                        // Checkbox types have an additional nested 'items' property
                        // that must be used for searching the enumerated fields.
                        if (property.format && property.format === 'checkbox') {
                            aggregationValues.push('items');
                        }

                        aggregations.push({
                            label: propName,
                            value: aggregationValues.join(','),
                            type: filterType
                        });
                    }
                });
            });
        }

        // Add the list of geographies availalable to the dropdown aggregation lists
        function loadGeographies(geographies) {
            _.each(geographies, function(geography) {
                aggregations.push({
                    label: geography.label,
                    value: geography.uuid,
                    type: geographyType
                });
            });
        }
    }

    angular.module('driver.customReports')
    .service('AggregationsConfig', AggregationsConfig);
})();

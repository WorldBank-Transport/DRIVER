(function () {
    'use strict';

    /* ngInject */
    function CustomReportsModalController($log, $modalInstance, $state, $window,
                                          FilterState, GeographyState, QueryBuilder,
                                          RecordState, RecordSchemaState) {
        var ctl = this;
        ctl.closeModal = closeModal;
        ctl.createReport = createReport;
        ctl.onParamChanged = onParamChanged;

        // Only the date part is needed when displaying these dates
        ctl.dateFormat = 'MMM D, YYYY';

        // These are set as the selections are made
        ctl.colAggSelected = null;
        ctl.rowAggSelected = null;
        ctl.geoAggSelected = null;

        // List of aggregations available for rows and columns.
        // The time-related options defined here (type: `Time`) are constant.
        // This list is later populated with all available filterable types (type: `Filter`),
        // and all available geographies (type: `Geography`).
        ctl.rowColAggs = [
            {
                label: 'Day of Month',
                value: 'day',
                type: 'Time'
            },
            {
                label: 'Day of Week',
                value: 'week_day',
                type: 'Time'
            },
            {
                label: 'Hour of Day',
                value: 'hour',
                type: 'Time'
            },
            {
                label: 'Month of Year',
                value: 'month',
                type: 'Time'
            },
            {
                label: 'Week of Year',
                value: 'week',
                type: 'Time'
            },
            {
                label: 'Year',
                value: 'year',
                type: 'Time'
            }
        ];

        init();

        function init() {
            ctl.ready = false;

            // Add the active filters for display
            ctl.nonDateFilters = _.omit(FilterState.filters, '__dateRange');
            ctl.dateFilter = FilterState.getDateFilter();

            // Add the list of geographies availalable to the dropdown aggregation lists
            loadGeographies();

            // Add the list of filters availalable to the dropdown aggregation lists
            RecordState.getSelected()
                .then(loadFilters);
        }

        function loadGeographies() {
            return GeographyState.getOptions().then(function(geographies) {
                _.each(geographies, function(geography) {
                    ctl.rowColAggs.push({
                        label: geography.label,
                        value: geography.uuid,
                        type: 'Geography'
                    });
                });
            });
        }

        /**
         * We can only aggregate on enumerated properties. Loops through the schema (at the
         * definition#property level, not recursively) and adds filters for each
         * enumerated property it finds.
         *
         * TODO:  add " || property.format === 'number'" to the condition to enable aggregating
         * numerical properties if/when that's implemented on the back end.
         */
        function loadFilters(recordType) {
            /* jshint camelcase: false */
            return RecordSchemaState.get(recordType.current_schema).then(function(schema) {
            /* jshint camelcase: true */
                _.forEach(schema.schema.definitions, function(definition, defName) {
                    _.forEach(definition.properties, function(property, propName) {
                        if (property.fieldType === 'selectlist') {
                            ctl.rowColAggs.push({
                                label: propName,
                                value: [defName, 'properties', propName].join(','),
                                type: 'Filter'
                            });
                        }
                    });
                });
            });
        }

        function closeModal() {
            $modalInstance.close();
        }

        /**
         * Helper for setting the correct params based on the type of aggregation
         * @param {rowOrCol} Key prefix string, can be 'row' or 'col'
         * @param {aggObj} An aggregation object from ctl.rowColAggs
         * @param {params} An object of HTML parameters that is updated with the new key/val
         */
        function setRowColParam(rowOrCol, aggObj, params) {
            var key = rowOrCol + '_';
            if (aggObj.type === 'Time') {
                key += 'period_type';
            } else if (aggObj.type === 'Filter') {
                key += 'choices_path';
            } else if (aggObj.type === 'Geography') {
                key += 'boundary_id';
            } else {
                $log.error('Cannot set row/col param with type: ', aggObj.type);
                return;
            }
            params[key] = aggObj.value;
        }

        function onParamChanged() {
            ctl.ready = false;
            if (ctl.colAggSelected && ctl.rowAggSelected) {
                assembleParams().then(function () { ctl.ready = true; });
            }
        }

        function assembleParams() {
            return QueryBuilder.assembleParams(0, true, true).then(
                function(params) {
                    var crosstabsParams = {};
                    setRowColParam('col', ctl.colAggSelected, crosstabsParams);
                    setRowColParam('row', ctl.rowAggSelected, crosstabsParams);

                    // Only allow specifying an aggregation boundary if no geographical
                    // aggregation was selected for rows/cols. Similar logic is in the partial
                    // for displaying/hiding the dropdown, but it is also performed here for
                    // good measure (e.g. if selections are made and then later changed).
                    /* jshint camelcase: false */
                    if (ctl.geoAggSelected &&
                        ctl.colAggSelected.type !== 'Geography' &&
                        ctl.rowAggSelected.type !== 'Geography') {
                        crosstabsParams.aggregation_boundary = ctl.geoAggSelected.value;
                    }
                    /* jshint camelcase: true */
                    params = _.extend(params, crosstabsParams);

                    // Ensure the page limit parameter is not set
                    if (params.limit) {
                        delete params.limit;
                    }

                    ctl.params = params;
                }
            );
        }

        function createReport() {
            $window.open($state.href('report', ctl.params, {absolute: true}), '_blank');
        }

        return ctl;
    }

    angular.module('driver.customReports')
    .controller('CustomReportsModalController', CustomReportsModalController);

})();

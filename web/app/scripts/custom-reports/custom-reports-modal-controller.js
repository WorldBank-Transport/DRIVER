(function () {
    'use strict';

    /* ngInject */
    function CustomReportsModalController($log, $modalInstance,
                                          FilterState, GeographyState, QueryBuilder,
                                          RecordState, RecordSchemaState) {
        var ctl = this;
        ctl.closeModal = closeModal;
        ctl.createReport = createReport;

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
            // Add the active filters for display
            ctl.nonDateFilters = _.omit(FilterState.filters, '__dateRange');
            ctl.dateFilter = FilterState.getDateFilter();

            // Add the list of geographies availalable to the dropdown aggregation lists
            loadGeographies();

            // Add the list of filters availalable to the dropdown aggregation lists
            RecordState.getSelected()
                .then(loadRecordSchema)
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

        function loadRecordSchema(recordType) {
            /* jshint camelcase: false */
            return RecordSchemaState.get(recordType.current_schema);
            /* jshint camelcase: true */
        }

        function loadFilters(recordSchema) {
            return RecordSchemaState.getFilterables(recordSchema.uuid).then(function(filters) {
                _.each(filters, function(filter, path) {
                    // The backend only supports enumerable (selectlist) fields
                    if (filter.fieldType === 'selectlist') {
                        ctl.rowColAggs.push({
                            label: path.split('#')[1],
                            value: path.replace('#', ','),
                            type: 'Filter'
                        });
                    }
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
            } else if (aggObj.type === 'Geometry') {
                key += 'boundary_id';
            } else {
                $log.error('Cannot set row/col param with type: ', aggObj.type);
                return;
            }
            params[key] = aggObj.value;
        }

        function createReport() {
            QueryBuilder.assembleParams(0, true, true).then(
                function(params) {
                    /* jshint camelcase: false */

                    var crosstabsParams = {};
                    setRowColParam('col', ctl.colAggSelected, crosstabsParams);
                    setRowColParam('row', ctl.rowAggSelected, crosstabsParams);

                    // Only allow specifying an aggregation boundary if no geographical
                    // aggregation was selected for rows/cols. Similar logic is in the partial
                    // for displaying/hiding the dropdown, but it is also performed here for
                    // good measure (e.g. if selections are made and then later changed).
                    if (ctl.geoAggSelected &&
                        ctl.colAggSelected.type !== 'Geography' &&
                        ctl.rowAggSelected.type !== 'Geography') {
                        crosstabsParams.aggregation_boundary = ctl.geoAggSelected.value;
                    }
                    params = _.extend(params, crosstabsParams);

                    // Ensure the page limit parameter is not set
                    if (params.limit) {
                        delete params.limit;
                    }

                    // We now have all the parameters needed for performing a crosstabs query.
                    // TODO: when reports page exists, open it in a new window with these params.

                    /* jshint camelcase: true */

                    $modalInstance.close();
                }
            );
        }

        return ctl;
    }

    angular.module('driver.customReports')
    .controller('CustomReportsModalController', CustomReportsModalController);

})();

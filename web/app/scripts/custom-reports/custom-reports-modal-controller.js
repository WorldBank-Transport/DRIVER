(function () {
    'use strict';

    /* ngInject */
    function CustomReportsModalController($log, $modalInstance, $state, $translate, $window,
                                          FilterState, GeographyState, BoundaryState, QueryBuilder,
                                          AggregationsConfig, DateLocalization) {
        var ctl = this;

        // Translated types used for determining how to set parameters appropriately
        var timeType = $translate.instant('AGG.TIME');
        var geographyType = $translate.instant('AGG.GEOGRAPHY');
        var filterType = $translate.instant('AGG.FILTER');

        ctl.$onInit = initialize();

        function initialize() {
            ctl.ready = false;

            ctl.calendar = DateLocalization.currentDateFormats().calendar;
            ctl.closeModal = closeModal;
            ctl.createReport = createReport;
            ctl.onParamChanged = onParamChanged;

            // Only the date part is needed when displaying these dates
            ctl.dateFormat = 'long';

            // These are set as the selections are made
            ctl.colAggSelected = null;
            ctl.rowAggSelected = null;
            ctl.geoAggSelected = null;

            // Add the active filters for display
            ctl.nonDateFilters = _.omit(FilterState.filters, ['__dateRange', '__createdRange']);
            ctl.dateFilter = FilterState.getDateFilter();

            GeographyState.getSelected().then(function (geography) {
                BoundaryState.getSelected().then(function (boundary) {
                    if (boundary && boundary.data) {
                        /* jshint camelcase: false */
                        ctl.boundaryFilter = boundary.data[geography.display_field];
                        /* jshint camelcase: true */
                    } else {
                        ctl.boundaryFilter = null;
                    }
                });
            });

            AggregationsConfig.getOptions().then(function (options) {
                ctl.rowColAggs = options;
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
            if (aggObj.type === timeType) {
                key += 'period_type';
            } else if (aggObj.type === filterType) {
                key += 'choices_path';
            } else if (aggObj.type === geographyType) {
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
            return QueryBuilder.assembleParams(0).then(
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
                    crosstabsParams.calendar = ctl.calendar;
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
            // If we were using $resource, Angular would automagically encode params that are
            // objects. But since we're using $state.href, we have to do it ourselves.
            var urlParams = _.mapValues(ctl.params, function (value) {
                if (typeof(value) === 'object') {
                    return angular.toJson(value);
                } else {
                    return value;
                }
            });

            $window.open($state.href('report', urlParams, {absolute: true}), '_blank');
        }

        return ctl;
    }

    angular.module('driver.customReports')
    .controller('CustomReportsModalController', CustomReportsModalController);

})();

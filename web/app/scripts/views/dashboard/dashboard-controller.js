(function () {
    'use strict';

    /* ngInject */
    function DashboardController($scope, $state, $timeout,
                                 FilterState, InitialState, Records,
                                 RecordSchemaState, RecordState, RecordAggregates, WebConfig) {
        var ctl = this;
        ctl.showBlackSpots = WebConfig.blackSpots.visible;

        InitialState.ready().then(init);

        function init() {
            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(loadRecordSchema)
                .then(loadRecords)
                .then(onRecordsLoaded);

            $scope.$on('driver.state.recordstate:selected', function(event, selected) {
                ctl.recordType = selected;
                loadRecords();
            });

            $scope.$on('driver.state.boundarystate:selected', function() {
                loadRecords();
            });
            $scope.$on('driver.savedFilters:filterSelected', function(event, selectedFilter) {
                $state.go('map');
                $timeout(function () {
                    FilterState.restoreFilters(selectedFilter);
                }, 2000);  // this needs to be quite long to avoid race conditions, unfortunately
            });
        }

        function loadRecordSchema() {
            /* jshint camelcase: false */
            var currentSchemaId = ctl.recordType.current_schema;
            /* jshint camelcase: true */

            return RecordSchemaState.get(currentSchemaId)
                .then(function(recordSchema) {
                    ctl.recordSchema = recordSchema;
                });
        }

        /*
         * Loads records for charts
         * @return {promise} Promise to load records
         */
        function loadRecords() {
            // We want to see only the last 90 days worth of records on the dashboard
            var now = new Date();
            var duration = moment.duration({ days: 90 });
            var today = now.toISOString();
            var threeMonthsBack = new Date(now - duration).toISOString();

            /* jshint camelcase: false */
            var params = {
              occurred_min: threeMonthsBack,
              occurred_max: today
            };
            /* jshint camelcase: true */

            var filterConfig = {
                doAttrFilters: false,
                doBoundaryFilter: true,
                doJsonFilters: false
            };

            RecordAggregates.toddow(params, filterConfig).then(function(toddowData) {
                ctl.toddow = toddowData;
            });

            RecordAggregates.socialCosts(params, filterConfig).then(
                function(costs) {
                    ctl.socialCosts = costs;
                },
                function(error) {
                    ctl.socialCosts = error;
                }
            );

            // The stepwise widget is only displayed when black spots are not visible
            if (!ctl.showBlackSpots) {
                RecordAggregates.stepwise(params).then(function(stepwiseData) {
                    ctl.minDate = threeMonthsBack;
                    ctl.maxDate = now;
                    ctl.stepwise = stepwiseData;
                });
            }
        }

        function onRecordsLoaded() {
            var detailsDefinitions = _.filter(ctl.recordSchema.schema.definitions, 'details');
            ctl.propertiesKey = detailsDefinitions[0].properties;
            ctl.headerKeys = _.without(_.keys(ctl.propertiesKey), '_localId');
        }
    }

    angular.module('driver.views.dashboard')
    .controller('DashboardController', DashboardController);

})();

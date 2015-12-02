(function () {
    'use strict';

    /* ngInject */
    function DashboardController($scope, $state, BoundaryState, FilterState, InitialState, Records,
                                 RecordSchemaState, RecordState, RecordAggregates) {
        var ctl = this;

        InitialState.ready().then(init);

        function init() {
            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(BoundaryState.getSelected().then(function(selected) {
                    ctl.boundaryId = selected.uuid;
                }))
                .then(loadRecordSchema)
                .then(loadRecords)
                .then(onRecordsLoaded);

            $scope.$on('driver.state.recordstate:selected', function(event, selected) {
                ctl.recordType = selected;
                loadRecords();
            });

            $scope.$on('driver.state.boundarystate:selected', function(event, selected) {
                ctl.boundaryId = selected.uuid;
                loadRecords();
            });
            $scope.$on('driver.savedFilters:filterSelected', function(event, selectedFilter) {
                FilterState.restoreFilters(selectedFilter);
                $state.go('map');
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
         * Loads records for toddow
         * @return {promise} Promise to load records
         */
        function loadRecords() {
            // We want to see only the last 90 days worth of records on the dashboard
            var now = new Date();
            var duration = moment.duration({ days:90 });
            var today = now.toISOString();
            var threeMonthsBack = new Date(now - duration).toISOString();

            /* jshint camelcase: false */
            var params = ctl.boundaryId ? {polygon_id: ctl.boundaryId} : {};
            params = angular.extend(params, {
              occurred_min: threeMonthsBack,
              occurred_max: today
            });
            /* jshint camelcase: true */

            RecordAggregates.toddow(false, params).then(function(toddowData) {
                ctl.toddow = toddowData;
            });
        }

        function onRecordsLoaded() {
            var detailsDefinitions = _.filter(ctl.recordSchema.schema.definitions, 'details');
            ctl.propertiesKey = detailsDefinitions[0].properties;
            ctl.headerKeys = _.without(_.keys(ctl.propertiesKey), '_localId');
            ctl.detailsProperty = detailsDefinitions[0].title;
        }
    }

    angular.module('driver.views.dashboard')
    .controller('DashboardController', DashboardController);

})();

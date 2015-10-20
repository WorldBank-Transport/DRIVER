(function () {
    'use strict';

    /* ngInject */
    function DashboardController($scope, Records, RecordSchemas, RecordAggregates,
                                 RecordTypeState, RecordState) {
        var ctl = this;

        initialize();

        $scope.$on('driver.state.recordtypestate:selected', function(event, selected) {
            ctl.recordType = selected;
            loadRecords();
        });

        function initialize() {
            RecordTypeState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(loadRecordSchema)
                .then(loadRecords)
                .then(onRecordsLoaded);

            RecordAggregates.toddow();
        }

        function loadRecordSchema() {
            /* jshint camelcase: false */
            var currentSchemaId = ctl.recordType.current_schema;
            /* jshint camelcase: true */

            return RecordSchemas.get({ id: currentSchemaId })
                .$promise.then(function(recordSchema) {
                    ctl.recordSchema = recordSchema;
                });
        }

        /*
         * Loads a page of records from the API
         * @return {promise} Promise to load records
         */
        function loadRecords() {
            /* jshint camelcase: false */
            var params = { record_type: ctl.recordType.uuid,
                           limit: 50 };
            /* jshint camelcase: true */

            Records.toddow().$promise.then(function(toddowData) {
                ctl.toddow = toddowData;
            });

            return RecordState.getRecords(false, 0, params)
                .then(function(records) {
                    ctl.records = records.results;
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

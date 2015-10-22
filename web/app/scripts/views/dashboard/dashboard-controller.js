(function () {
    'use strict';

    /* ngInject */
    function DashboardController($scope, Records, RecordSchemas, RecordState, RecordAggregates) {
        var ctl = this;

        initialize();

        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            ctl.recordType = selected;
            loadRecords();
        });

        function initialize() {
            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(loadRecordSchema)
                .then(loadRecords)
                .then(onRecordsLoaded);
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
            var params = { limit: 50 };
            /* jshint camelcase: true */

            RecordAggregates.toddow(false).then(function(toddowData) {
                ctl.toddow = toddowData;
            });

            return Records.get(params)
                .$promise.then(function(records) {
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

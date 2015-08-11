(function () {
    'use strict';

    /* ngInject */
    function RecordListController($log, $state, $stateParams, uuid4, Notifications,
                                 Records, RecordSchemas, RecordTypes) {
        var ctl = this;
        ctl.currentOffset = 0;
        ctl.numRecordsPerPage = 10;
        ctl.maxDataColumns = 4; // Max number of dynamic data columns to show
        ctl.getPreviousRecords = getPreviousRecords;
        ctl.getNextRecords = getNextRecords;

        initialize();

        function initialize() {
            loadRecordType()
                .then(loadRecordSchema)
                .then(loadRecords)
                .then(onRecordsLoaded);
        }

        function loadRecordType () {
            return RecordTypes.get({ id: $stateParams.rtuuid })
                .$promise.then(function(recordType) {
                    ctl.recordType = recordType;
                });
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
         * @param {int} offset Optional offset value, relative to current offset, used
         *                     for pulling paginated results. May be positive or negative.
         * @return {promise} Promise to load records
         */
        function loadRecords(offset) {
            /* jshint camelcase: false */
            var params = { record_type: $stateParams.rtuuid };
            /* jshint camelcase: true */

            if (offset) {
                ctl.currentOffset += offset;
                if (ctl.currentOffset) {
                    params.offset = ctl.currentOffset;
                }
            }

            return Records.get(params)
                .$promise.then(function(records) {
                    ctl.records = records;
                });
        }

        function onRecordsLoaded() {
            ctl.detailsProperty = ctl.recordType.label + ' Details';
            ctl.propertiesKey = ctl.recordSchema.schema.definitions[ctl.detailsProperty].properties;
            ctl.headerKeys = _.without(_.keys(ctl.propertiesKey), '_localId');
        }

        // Loads the previous page of paginated record results
        function getPreviousRecords() {
            loadRecords(-ctl.numRecordsPerPage);
        }

        // Loads the next page of paginated record results
        function getNextRecords() {
            loadRecords(ctl.numRecordsPerPage);
        }
    }

    angular.module('driver.views.record')
    .controller('RecordListController', RecordListController);

})();

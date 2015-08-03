(function () {
    'use strict';

    /* ngInject */
    function RecordListController($log, $state, $stateParams, uuid4, Notifications,
                                 Records, RecordSchemas, RecordTypes) {
        var ctl = this;

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

        function loadRecords() {
            /* jshint camelcase: false */
            return Records.get({ record_type: $stateParams.rtuuid })
            /* jshint camelcase: true */
                .$promise.then(function(records) {
                    ctl.records = records.results;
                });
        }

        function onRecordsLoaded() {
            ctl.detailsProperty = ctl.recordType.label + ' Details';
            ctl.propertiesKey = ctl.recordSchema.schema.definitions[ctl.detailsProperty].properties;
            ctl.headerKeys = _.without(_.keys(ctl.propertiesKey), '_localId');
        }
    }

    angular.module('driver.views.record')
    .controller('RecordListController', RecordListController);

})();

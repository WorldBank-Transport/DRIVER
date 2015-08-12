(function () {
    'use strict';

    /* ngInject */
    function RecordDetailsController($log, $state, $stateParams, uuid4, Notifications,
                                 Records, RecordSchemas, RecordTypes) {
        var ctl = this;

        initialize();

        function initialize() {
            loadRecord()
                .then(loadRecordType)
                .then(loadRecordSchema)
                .then(onDataReady);
        }

        function loadRecord () {
            return Records.get({ id: $stateParams.recorduuid })
                .$promise.then(function(record) {
                    ctl.record = record;
                });
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

        function onDataReady() {
            // TODO: display the record nicely
        }
    }

    angular.module('driver.views.record')
    .controller('RecordDetailsController', RecordDetailsController);

})();

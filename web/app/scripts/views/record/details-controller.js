(function () {
    'use strict';

    /* ngInject */
    function RecordDetailsController($stateParams,
                                     Records, RecordSchemas, RecordState) {
        var ctl = this;
        initialize();

        function initialize() {
            loadRecord()
                .then(loadRecordType)
                .then(loadRecordSchema);
        }

        function loadRecord () {
            return Records.get({ id: $stateParams.recorduuid })
                .$promise.then(function(record) {
                    ctl.record = record;
                });
        }

        function loadRecordType () {
            return RecordState.getSelected()
                .then(function(recordType) {
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
    }

    angular.module('driver.views.record')
    .controller('RecordDetailsController', RecordDetailsController);

})();

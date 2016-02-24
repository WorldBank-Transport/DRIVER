(function () {
    'use strict';

    /* ngInject */
    function RecordDetailsController($stateParams, Records, RecordSchemaState, RecordTypes) {
        var ctl = this;
        initialize();

        function initialize() {
            loadRecord()
                .then(loadRecordSchema);
        }

        function loadRecord () {
            return Records.get({ id: $stateParams.recorduuid })
                .$promise.then(function(record) {
                    ctl.record = record;
                });
        }

        function loadRecordSchema() {
            return RecordTypes.query({ record: $stateParams.recorduuid }).$promise
                .then(function (result) {
                    ctl.recordType = result[0];
                    /* jshint camelcase: false */
                    return RecordSchemaState.get(ctl.recordType.current_schema)
                    /* jshint camelcase: true */
                        .then(function(recordSchema) { ctl.recordSchema = recordSchema; });
                });
        }
    }

    angular.module('driver.views.record')
    .controller('RecordDetailsController', RecordDetailsController);

})();

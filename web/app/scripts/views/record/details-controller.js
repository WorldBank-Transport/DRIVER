(function () {
    'use strict';

    /* ngInject */
    function RecordDetailsController($stateParams, Records, RecordTypes,
                                     RecordState, RecordSchemaState) {
        var ctl = this;
        initialize();

        function initialize() {
            loadRecord().then(loadRecordSchema);
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
                    RecordState.getSecondary().then(function (secondaryType) {
                        if (!!secondaryType && secondaryType.uuid === ctl.recordType.uuid) {
                            ctl.isSecondary = true;
                        } else {
                            ctl.isSecondary = false;
                        }
                        // TODO: refactor things off the object and onto the schema so that we
                        // don't have to change behavior based on record type.
                        ctl.record.isSecondary = ctl.isSecondary;
                        /* jshint camelcase: false */
                        return RecordSchemaState.get(ctl.recordType.current_schema)
                        /* jshint camelcase: true */
                            .then(function(recordSchema) { ctl.recordSchema = recordSchema; });
                    });
                });
        }
    }

    angular.module('driver.views.record')
    .controller('RecordDetailsController', RecordDetailsController);

})();

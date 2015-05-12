(function () {
    'use strict';

    /* ngInject */
    function RTDetailController($stateParams, RecordSchemas, RecordTypes) {
        var ctl = this;
        ctl.deleteSchema = deleteSchema;
        initialize();

        function initialize() {
            RecordTypes.get({ id: $stateParams.uuid }).$promise.then(function (data) {
                ctl.recordType = data;
                ctl.currentSchema = RecordSchemas.get({ id: ctl.recordType.current_schema });
            });
        }

        function deleteSchema(key) {
            if (ctl.currentSchema.schema.definitions[key]) {
                delete ctl.currentSchema.schema.definitions[key];
                // TODO: Error handle and revert delete if failure
                RecordSchemas.create({
                    record_type: ctl.recordType.uuid,
                    schema: ctl.currentSchema.schema
                });
            }
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTDetailController', RTDetailController);
})();
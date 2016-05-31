(function () {
    'use strict';

    /* ngInject */
    function RTRelatedController($stateParams, RecordSchemas, RecordTypes) {
        var ctl = this;
        ctl.deleteSchema = deleteSchema;
        initialize();

        function initialize() {
            RecordTypes.get({ id: $stateParams.uuid }).$promise.then(function (data) {
                ctl.recordType = data;
                /* jshint camelcase:false */
                ctl.currentSchema = RecordSchemas.get({ id: ctl.recordType.current_schema });
                /* jshint camelcase:true */
            });
        }

        function deleteSchema(key) {
            if (ctl.currentSchema.schema.definitions[key]) {
                delete ctl.currentSchema.schema.definitions[key];
                delete ctl.currentSchema.schema.properties[key];
                // TODO: Error handle and revert delete if failure
                RecordSchemas.create({
                    /* jshint camelcase:false */
                    record_type: ctl.recordType.uuid,
                    schema: ctl.currentSchema.schema
                    /* jshint camelcase:true */
                });
            }
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTRelatedController', RTRelatedController);
})();

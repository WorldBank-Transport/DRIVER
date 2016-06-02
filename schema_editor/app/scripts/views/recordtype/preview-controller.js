(function () {
    'use strict';

    /* ngInject */
    function RTPreviewController($stateParams, RecordTypes, RecordSchemas) {
        var ctl = this;
        ctl.onDataChange = angular.noop;
        initialize();

        function initialize() {
            loadRecordType()
                .then(loadRecordSchema)
                .then(onSchemaReady);
        }

        // Helper for loading the record type
        function loadRecordType () {
            return RecordTypes.get({ id: $stateParams.uuid })
                .$promise.then(function(recordType) {
                    ctl.recordType = recordType;
                });
        }

        // Helper for loading the record schema
        function loadRecordSchema() {
            /* jshint camelcase: false */
            var currentSchemaId = ctl.recordType.current_schema;
            /* jshint camelcase: true */

            return RecordSchemas.get({ id: currentSchemaId })
                .$promise.then(function(recordSchema) {
                    ctl.recordSchema = recordSchema;
                });
        }

        // Called after all prerequesite data has been loaded
        function onSchemaReady() {
            /* jshint camelcase: false */
            ctl.editor = {
                id: 'preview-editor',
                options: {
                    schema: ctl.recordSchema.schema,
                    disable_edit_json: true,
                    disable_properties: true,
                    disable_array_add: false,
                    theme: 'bootstrap3',
                    show_errors: 'change',
                    no_additional_properties: true
                },
                errors: []
            };
            /* jshint camelcase: true */
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTPreviewController', RTPreviewController);
})();

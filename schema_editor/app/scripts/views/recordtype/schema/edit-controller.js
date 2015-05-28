(function () {
    'use strict';

    /* ngInject */
    function RTSchemaEditController($log, $stateParams,
                                    BuilderSchemas, RecordTypes, RecordSchemas, Schemas) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.schemaKey = $stateParams.schema;
            ctl.onDataChange = onDataChange;
            loadRecordType()
                .then(loadRecordSchema)
                .then(loadRelatedBuilderSchema)
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

        // Helper for loading the related builder schema
        function loadRelatedBuilderSchema () {
            return BuilderSchemas.get({ name: 'related' })
                .$promise.then(function(relatedBuilderSchema) {
                    ctl.relatedBuilderSchema = relatedBuilderSchema;
                });
        }

        // Called after all prerequesite data has been loaded
        function onSchemaReady() {
            // Need to call toJSON here in order to strip the additional angular
            // resource properties, as they don't play well with json-editor.
            var schema = ctl.relatedBuilderSchema.toJSON();

            // Populate saved properties
            // TODO: Schema deserialization here, probably
            var definition = ctl.recordSchema.schema.definitions[ctl.schemaKey];
            schema.description = definition.description;
            schema.title = definition.title;

            // Configure the json-editor
            ctl.editor = {
                id: 'schema-editor',
                options: {
                    /* jshint camelcase: false */
                    schema: schema,
                    disable_edit_json: true,
                    disable_properties: true,
                    disable_array_add: false,
                    no_additional_properties: true,
                    theme: 'bootstrap3'
                    /* jshint camelcase: true */
                }
            };
        }

        function onDataChange(newData) {
            $log.debug('Related type definition from form data:', Schemas.definitionFromSchemaFormData(newData));
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTSchemaEditController', RTSchemaEditController);
})();

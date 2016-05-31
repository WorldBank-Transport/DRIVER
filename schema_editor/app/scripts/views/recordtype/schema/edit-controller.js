(function () {
    'use strict';

    /* ngInject */
    function RTSchemaEditController($log, $stateParams, BuilderSchemas, RecordTypes,
                                    RecordSchemas, Schemas, Notifications, JsonEditorDefaults) {
        var ctl = this;
        var editorData = null;

        initialize();

        function initialize() {
            ctl.schemaKey = $stateParams.schema;
            ctl.onDataChange = onDataChange;
            ctl.onSaveClicked = onSaveClicked;
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
                    ctl.schemaTitle = recordSchema.schema.definitions[ctl.schemaKey].title;
                });
        }

        // Helper for loading the related builder schema
        function loadRelatedBuilderSchema () {
            return BuilderSchemas.get({ name: 'related' })
                .$promise.then(function(relatedBuilderSchema) {
                    ctl.relatedBuilderSchema = relatedBuilderSchema;
                });
        }

        // Called after all prerequisite data has been loaded
        function onSchemaReady() {
            // Get a list of the titles of all relatedContentTypes which have '_localId' as
            // a property.
            var referable = _.pick(ctl.recordSchema.schema.definitions, function(definition) {
                return !!definition.properties._localId;
            });
            // Don't allow referring to the type currently being edited
            referable = _.pick(referable, function(definition, key) {
                return key !== ctl.schemaKey;
            });
            // Map referable to objects -- needed in newer versions of json-editor
            referable = _.map(referable, function(definition, key) {
                return {
                    value: key,
                    title: definition.title
                };
            });

            // Modify the relatedBuilderSchema in-place in order to allow selecting a related
            // content type as the target of an internal reference.
            ctl.relatedBuilderSchema
                .definitions
                .localReference
                .properties
                .referenceTarget
                .enumSource = [{
                    source: referable,
                    title: '{{item.title}}',
                    value: '{{item.value}}'
                }];

            // Need to call toJSON here in order to strip the additional angular
            // resource properties, as they don't play well with json-editor.
            var schema = ctl.relatedBuilderSchema.toJSON();

            // Populate saved properties
            /* jshint camelcase: false */
            var definition = ctl.recordSchema.schema.definitions[ctl.schemaKey];
            schema.description = definition.description;
            schema.title = definition.title;
            schema.plural_title = definition.plural_title;
            /* jshint camelcase: true */
            var initialData = Schemas.schemaFormDataFromDefinition(definition);
            $log.debug('Initializing form with startval', initialData);

            // Configure the json-editor
            /* jshint camelcase: false */
            ctl.editor = {
                id: 'schema-editor',
                options: {
                    schema: schema,
                    disable_edit_json: true,
                    disable_properties: true,
                    disable_array_add: false,
                    theme: 'bootstrap3',
                    show_errors: 'change',
                    no_additional_properties: true,
                    startval: initialData
                },
                errors: []
            };
            /* jshint camelcase: true */

            JsonEditorDefaults.customValidators.push(validateNoSelfReference);
        }

        function onDataChange(newData, validationErrors) {
            // Update editorData reference: used later during save
            editorData = newData;

            // Perform custom validation
            var customErrors = Schemas.validateSchemaFormData(newData);
            ctl.editor.errors = validationErrors.concat(customErrors);

            $log.debug('Schema Entry Form data:', newData,
                       'Errors:', validationErrors,
                       'CustomErrors:', customErrors);
        }

        // Make sure that reference fields aren't referring to this type; this causes
        // an infinite recursion when displaying the edit form.
        function validateNoSelfReference(schema, value, path) {
            var errors = [];
            var pathKey = 'referenceTarget';
            if (!value || typeof value !== 'object' || !value.referenceTarget) {
                return errors;
            }

            if (value.referenceTarget === ctl.schemaKey) {
                errors.push({
                    path: path,
                    property: pathKey,
                    message: 'Relationship must be to a different related content type'
                });
            }
            return errors;
        }

        function onSaveClicked() {
            // First we confirm that the form data is valid; then we know we have something which
            // we can transform into a Data Form Schema.
            if (ctl.editor.errors.length > 0) {
                Notifications.show({
                    displayClass: 'alert-danger',
                    text: 'Saving failed: invalid data schema definition'
                });
                $log.debug('Validation errors on save:', ctl.editor.errors);
                return;
            }
            // All is well; serialize the form data into a JSON-Schema snippet.
            var dataToSave = Schemas.definitionFromSchemaFormData(editorData,
                    ctl.recordSchema.schema,
                    ctl.schemaKey);
            $log.debug('Serialized schema to save:', dataToSave);

            // Extend the definitions with the new data. Need to extend rather than
            // update in order to preserve the other attributes (title/etc.)
            var definitions = ctl.recordSchema.schema.definitions;
            definitions[ctl.schemaKey] = angular.extend(definitions[ctl.schemaKey], dataToSave);

            // Save the updated schema
            RecordSchemas.create({
                /* jshint camelcase:false */
                record_type: ctl.recordType.uuid,
                schema: ctl.recordSchema.schema
                /* jshint camelcase:true */
            }).$promise
                .then(function() {
                    Notifications.show({
                        text: 'Schema saved successfully',
                        displayClass: 'alert-success',
                        timeout: 3000
                    });
                })
                .catch(function(error) {
                    $log.debug('Error saving schema:', error);
                    Notifications.show({
                        text: 'Error saving schema: ' + error.statusText,
                        displayClass: 'alert-danger',
                        timeout: 3000
                    });
                });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTSchemaEditController', RTSchemaEditController);
})();

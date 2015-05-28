(function () {
    'use strict';

    /* ngInject */
    function RTSchemaEditController($log, $stateParams,
                                    RecordTypes, RecordSchemas, Schemas, Utils, Notifications) {
        var ctl = this;
        var schema = null;
        var editorData = null;
        initialize();

        function initialize() {
            ctl.schemaKey = $stateParams.schema;
            ctl.editor = {
                id: 'test-id',
                options: {
                    /* jshint camelcase: false */
                    schema: null,
                    disable_edit_json: true,
                    disable_properties: true,
                    disable_array_add: false,
                    theme: 'bootstrap3',
                    show_errors: 'change'
                    /* jshint camelcase: true */
                },
                errors: []
            };

            // Pick out just the labels; these will go into the dropdown.
            ctl.fieldTypes = _.mapValues(Schemas.FieldTypes, function(ft) {
                return ft.label;
            });

            RecordTypes.get({ id: $stateParams.uuid }).$promise.then(function (recordType) {
                ctl.recordType = recordType;
                /* jshint camelcase: false */
                RecordSchemas.get({ id: ctl.recordType.current_schema }).$promise.then(onSchemaReady);
                /* jshint camelcase: true */
            });

            ctl.onDataChange = onDataChange;
            ctl.onEditorAddClicked = onEditorAddClicked;
            ctl.onSaveClicked = onSaveClicked;
        }

        function extendEditor(options) {
            ctl.editor.options = angular.extend({}, ctl.editor.options, options);
        }

        function onSchemaReady(recordSchema) {
            // TODO: Schema deserialization here, probably
            schema = recordSchema.schema.definitions[ctl.schemaKey];
            extendEditor({ schema: schema });
        }

        function onDataChange(newData, validationErrors) {
            $log.debug('Schema Entry Form data:', newData, 'Errors:', validationErrors);
            editorData = newData;
            // Perform custom validation
            var customErrors = Schemas.validateSchemaFormData(editorData);
            ctl.editor.errors = validationErrors.concat(customErrors);
            // TODO: Fix Save button disablement
        }

        function onEditorAddClicked(fieldKey) {
            var fieldTitle = Schemas.FieldTypes[fieldKey].label;
            var fieldOptions = {
                title: fieldTitle
            };
            schema.properties[Utils.makeID()] = Schemas.fieldFromKey(fieldKey, fieldOptions);
            extendEditor({ schema: schema });
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
            var dataToSave = Schemas.definitionFromSchemaFormData(editorData);
            $log.debug('Serialized schema to save:', dataToSave);
            Notifications.show({ text: 'Success!', displayClass: 'alert-success', timeout: 3000 });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTSchemaEditController', RTSchemaEditController);
})();

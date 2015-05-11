(function () {
    'use strict';

    /* ngInject */
    function RTSchemaEditController($log, $stateParams,
                                    RecordTypes, RecordSchemas, Schemas) {
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
                    disable_array_add: true,
                    theme: 'bootstrap3'
                    /* jshint camelcase: true */
                }
            };
            ctl.fieldTypes = Schemas.FieldTypes;

            RecordTypes.get({ id: $stateParams.uuid }).$promise.then(function (recordType) {
                ctl.recordType = recordType;
                /* jshint camelcase: false */
                RecordSchemas.get({ id: ctl.recordType.current_schema }).$promise.then(onSchemaReady);
                /* jshint camelcase: true */
            });

            ctl.onDataChange = onDataChange;
            ctl.onEditorAddClicked = onEditorAddClicked;
        }

        function extendEditor(options) {
            ctl.editor.options = angular.extend({}, ctl.editor.options, options);
        }

        function onSchemaReady(recordSchema) {
            schema = recordSchema.schema.definitions[ctl.schemaKey];
            extendEditor({ schema: schema });
        }

        function onDataChange(newData) {
            $log.debug('EditController Form Data:', newData);
            editorData = newData;
        }

        function onEditorAddClicked(fieldKey) {
            var fieldTitle = Schemas.FieldTypes[fieldKey];
            var fieldOptions = {
                title: fieldTitle
            };
            var field = null;
            switch (fieldKey) {
                case 'text':
                    field = Schemas.Fields.TextField(fieldOptions);
                    break;
                case 'selectlist':
                    field = Schemas.Fields.SelectList(fieldOptions);
                    break;
                default:
                    throw 'key must be one of Schemas.FieldTypes';
            }
            schema.properties[makeID()] = field;
            extendEditor({ schema: schema });
        }

        function makeID() {
            var text = '';
            var possible = 'ABCDEFGHIkLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 0; i < 8; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTSchemaEditController', RTSchemaEditController);
})();

(function () {
    'use strict';

    /* ngInject */
    function RTSchemaEditController($log, $stateParams,
                                    RecordTypes, RecordSchemas, Schemas, Utils) {
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
                    theme: 'bootstrap3'
                    /* jshint camelcase: true */
                }
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
        }

        function extendEditor(options) {
            ctl.editor.options = angular.extend({}, ctl.editor.options, options);
        }

        function onSchemaReady(recordSchema) {
            // TODO: Schema deserialization here, probably
            schema = recordSchema.schema.definitions[ctl.schemaKey];
            extendEditor({ schema: schema });
        }

        function onDataChange(newData) {
            $log.debug('Related type definition from form data:', Schemas.definitionFromSchemaFormData(newData));
            editorData = newData;
        }

        function onEditorAddClicked(fieldKey) {
            var fieldTitle = Schemas.FieldTypes[fieldKey].label;
            var fieldOptions = {
                title: fieldTitle
            };
            schema.properties[Utils.makeID()] = Schemas.fieldFromKey(fieldKey, fieldOptions);
            extendEditor({ schema: schema });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTSchemaEditController', RTSchemaEditController);
})();

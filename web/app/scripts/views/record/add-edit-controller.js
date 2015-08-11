(function () {
    'use strict';

    /* ngInject */
    function RecordAddEditController($log, $state, $stateParams, uuid4, Notifications,
                                 Records, RecordSchemas, RecordTypes) {
        var ctl = this;
        var editorData = null;

        initialize();

        function initialize() {
            ctl.onDataChange = onDataChange;
            ctl.onSaveClicked = onSaveClicked;

            loadRecordType()
                .then(loadRecordSchema)
                .then(onSchemaReady);
        }

        function loadRecordType () {
            return RecordTypes.get({ id: $stateParams.rtuuid })
                .$promise.then(function(recordType) {
                    ctl.recordType = recordType;
                });
        }

        function loadRecordSchema() {
            /* jshint camelcase: false */
            var currentSchemaId = ctl.recordType.current_schema;
            /* jshint camelcase: true */

            return RecordSchemas.get({ id: currentSchemaId })
                .$promise.then(function(recordSchema) {
                    ctl.recordSchema = recordSchema;
                });
        }

        function onSchemaReady() {
            ctl.editor = {
                id: 'new-record-editor',
                options: {
                    /* jshint camelcase: false */
                    schema: ctl.recordSchema.schema,
                    disable_edit_json: true,
                    disable_properties: true,
                    disable_array_add: false,
                    theme: 'bootstrap3',
                    show_errors: 'change',
                    no_additional_properties: true
                    /* jshint camelcase: true */
                },
                errors: []
            };
        }

        /*
         * Recursively sets all empty _localId fields to a new uuid
         * @param {object} obj The object to recursively search
         * @return {bool} True if any changes were made
         */
        function setLocalIds(obj) {
            var changed = false;
            _.each(obj, function(propertyValue, propertyName) {
                if (propertyName === '_localId' && !propertyValue) {
                    obj._localId = uuid4.generate();
                    changed = true;
                } else if (propertyValue instanceof Array) {
                    _.each(propertyValue, function(item) {
                        changed = changed || setLocalIds(item);
                    });
                } else if (propertyValue instanceof Object) {
                    changed = changed || setLocalIds(propertyValue);
                }
            });
            return changed;
        }

        function onDataChange(newData, validationErrors, editor) {
            // Fill in all empty _localId fields
            if (setLocalIds(newData)) {
                editor.setValue(newData);
                return;
            }

            // Update editorData reference: used later during save
            editorData = newData;
            ctl.editor.errors = validationErrors;
        }

        function onSaveClicked() {
            if (ctl.editor.errors.length > 0) {
                Notifications.show({
                    displayClass: 'alert-danger',
                    text: 'Saving failed: invalid record'
                });
                $log.debug('Validation errors on save:', ctl.editor.errors);
                return;
            }

            Records.create({
                /* jshint camelcase: false */
                data: editorData,
                schema: ctl.recordSchema.uuid,

                // TODO: the following fields are external to the schema and need to be implemented.
                // Generating bogus values for now -- to be revisited in a future task.
                slug: 'testslug', // Note: don't think we need a slug for a record, uuid seems fine
                label: 'testlabel', // Note: label also seems unnecessarry for a record
                geom: 'POINT (0 0)', // TODO: we'll need a map with ability to search/drop a point
                occurred_from: new Date(), // TODO: we'll need date pickers for occured from/to
                occurred_to: new Date()
                /* jshint camelcase: true */
            }).$promise.then(function (record) {
                $log.debug('Saved record with uuid: ', record.uuid);
                $state.go('record.list', {
                    rtuuid: $stateParams.rtuuid
                });
            }, function (error) {
                $log.debug('Error while creating record:', error);
            });
        }
    }

    angular.module('driver.views.record')
    .controller('RecordAddEditController', RecordAddEditController);

})();

(function () {
    'use strict';

    /* ngInject */
    function RecordAddEditController($log, $state, $stateParams, uuid4, Notifications,
                                 Records, RecordSchemas, RecordTypes) {
        var ctl = this;
        var editorData = null;

        // expected format to save successfully
        var dateTimeFormat = 'YYYY-MM-DDThh:mm:ss';

        initialize();

        // Initialize for either adding or editing, depending on recorduuid being supplied
        function initialize() {
            ctl.onDataChange = onDataChange;
            ctl.onSaveClicked = onSaveClicked;
            ctl.occuredFromChanged = occuredFromChanged;
            ctl.occuredToChanged = occuredToChanged;

            ctl.occuredFromOptions = {format: dateTimeFormat};
            ctl.occuredToOptions = {format: dateTimeFormat};

            var recordPromise = $stateParams.recorduuid ? loadRecord() : null;
            (recordPromise ? recordPromise.then(loadRecordType) : loadRecordType())
                .then(loadRecordSchema)
                .then(onSchemaReady);
        }

        // Helper for loading the record -- only used when in edit mode
        function loadRecord() {
            return Records.get({ id: $stateParams.recorduuid })
                .$promise.then(function(record) {
                    ctl.record = record;
                });
        }

        function loadRecordType() {
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

        function occuredFromChanged() {
            $log.debug('occured from changed');
            $log.debug(ctl.occuredFrom);
            //ctl.occuredToOptions = {minDate: ctl.occuredFrom};
        }

        function occuredToChanged() {
            $log.debug('occured to changed');
            $log.debug(ctl.occuredTo);
            //ctl.occuredFromOptions = {maxDate: ctl.occuredTo};
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
                    no_additional_properties: true,
                    startval: ctl.record ? ctl.record.data : null
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

            // If there is already a record, set the new editorData and update, else create one
            var saveMethod = null;
            var dataToSave = null;
            if (ctl.record) {
                saveMethod = 'update';
                dataToSave = ctl.record;
                dataToSave.data = editorData;
            } else {
                saveMethod = 'create';
                dataToSave = {
                    /* jshint camelcase: false */
                    data: editorData,
                    schema: ctl.recordSchema.uuid,

                    // constant fields
                    slug: ctl.slug,
                    label: ctl.label,
                    geom: 'POINT(0 0)',
                    occurred_from: ctl.occuredFrom,
                    occurred_to: ctl.occuredTo

                    /* jshint camelcase: true */
                };
            }

            Records[saveMethod](dataToSave, function (record) {
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

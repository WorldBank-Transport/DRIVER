(function () {
    'use strict';

    /* ngInject */
    function RecordAddEditController($log, $scope, $state, $stateParams, uuid4, Notifications,
                                 Records, RecordSchemas, RecordState) {
        var ctl = this;
        var editorData = null;

        // expected format to save successfully
        var dateTimeFormat = 'YYYY-MM-DDThh:mm:ss';

        initialize();

        // Initialize for either adding or editing, depending on recorduuid being supplied
        function initialize() {
            ctl.onDataChange = onDataChange;
            ctl.onSaveClicked = onSaveClicked;
            ctl.occurredFromChanged = occurredFromChanged;
            ctl.occurredToChanged = occurredToChanged;
            ctl.onGeomChanged = onGeomChanged;

            ctl.occurredFromOptions = {format: dateTimeFormat};
            ctl.occurredToOptions = {format: dateTimeFormat};

            ctl.geom = {
                lat: null,
                lng: null
            };

            $scope.$on('driver.views.record:marker-moved', function(event, data) {
                // update location when map marker set
                $scope.$apply(function() {
                    ctl.geom.lat = data[1];
                    ctl.geom.lng = data[0];
                });
            });

            var recordPromise = $stateParams.recorduuid ? loadRecord() : null;
            (recordPromise ? recordPromise.then(loadRecordType) : loadRecordType())
                .then(loadRecordSchema)
                .then(onSchemaReady);
        }

        // tell embed-map-directive to update marker location
        function onGeomChanged() {
            if (ctl.geom.lat && ctl.geom.lng) {
                $scope.$emit('driver.views.record:location-selected', ctl.geom);
            }
        }

        // Helper for loading the record -- only used when in edit mode
        function loadRecord() {
            return Records.get({ id: $stateParams.recorduuid })
                .$promise.then(function(record) {
                    ctl.record = record;

                    // set lat/lng array into bind-able object
                    ctl.geom.lat = ctl.record.geom.coordinates[1];
                    ctl.geom.lng = ctl.record.geom.coordinates[0];

                    // notify map
                    onGeomChanged();
                });
        }

        function loadRecordType() {
            return RecordState.getSelected()
                .then(function(recordType) {
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

        function occurredFromChanged() {
            $log.debug('occurred from changed');
            /* jshint camelcase: false */
            $log.debug(ctl.record.occurred_from);
            // TODO: dynamically set min/max dates
            //ctl.occurredToOptions = {minDate: ctl.record.occurred_from};
            /* jshint camelcase: true */
        }

        function occurredToChanged() {
            $log.debug('occurred to changed');
            /* jshint camelcase: false */
            $log.debug(ctl.record.occurred_to);
            // TODO: dynamically set min/max dates
            //ctl.occurredFromOptions = {maxDate: ctl.record.occurred_to};
            /* jshint camelcase: true */
        }

        /*
         * Ensures each object in the record contains all appropriate properties available
         * from the schema. This is a workaround for a problem with json-editor. When it
         * saves an item it removes any properties that aren't set, and then when the
         * item is loaded into the editor again, any properties that aren't set aren't
         * rendered even though they exist within the schema. Thus, in the course of
         * editing, if anything is ever removed, or an enum is set to empty, it will never
         * be able to be selected again. This works around those problems.
         */
        function fixEmptyFields() {
            if (!ctl.record) {
                return;
            }

            _.forEach(ctl.recordSchema.schema.definitions, function(definition, defKey) {
                _.forEach(definition.properties, function(property, propKey) {
                    if (!ctl.record.data.hasOwnProperty(defKey)) {
                        ctl.record.data[defKey] = null;
                    }
                    var data = ctl.record.data[defKey];

                    _.forEach(definition.multiple ? data : [data], function(item) {
                        if (item && !item.hasOwnProperty(propKey)) {
                            item[propKey] = null;
                        }
                    });
                });
            });
        }

        function onSchemaReady() {
            fixEmptyFields();

            /* jshint camelcase: false */
            ctl.editor = {
                id: 'new-record-editor',
                options: {
                    schema: ctl.recordSchema.schema,
                    disable_edit_json: true,
                    disable_properties: true,
                    disable_array_add: false,
                    theme: 'bootstrap3',
                    show_errors: 'change',
                    no_additional_properties: true,
                    startval: ctl.record ? ctl.record.data : null
                },
                errors: []
            };
            /* jshint camelcase: true */
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

        function areConstantFieldsValid() {
            /* jshint camelcase: false */

            // basic validation for constant fields
            if (!ctl.record || !ctl.record.slug || !ctl.record.label ||
                !ctl.geom.lat|| !ctl.geom.lng || !ctl.record.occurred_from) {

                $log.debug('Missing required constant field(s)');
                return false;
            }

            if (ctl.record.occurred_from > ctl.record.occurred_to) {
                $log.debug('occurred from date cannot be later than occurred to date');
                return false;
            }
            /* jshint camelcase: true */

            return true;
        }

        function onSaveClicked() {
            if (ctl.editor.errors.length > 0 || !areConstantFieldsValid()) {
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
            if (ctl.record.geom) {
                // set back coordinates
                ctl.record.geom.coordinates = [ctl.geom.lng, ctl.geom.lat];
                saveMethod = 'update';
                // set `to` date to match `from` date
                ctl.record.occurred_to = ctl.record.occurred_from;
                dataToSave = ctl.record;
                dataToSave.data = editorData;
            } else {
                saveMethod = 'create';
                dataToSave = {
                    /* jshint camelcase: false */
                    data: editorData,
                    schema: ctl.recordSchema.uuid,

                    // constant fields
                    slug: ctl.record.slug,
                    label: ctl.record.label,
                    geom: 'POINT(' + ctl.geom.lng + ' ' + ctl.geom.lat + ')',
                    occurred_from: ctl.record.occurred_from,
                    // set `to` date to match `from` date
                    occurred_to: ctl.record.occurred_from
                    /* jshint camelcase: true */
                };
            }

            Records[saveMethod](dataToSave, function (record) {
                $log.debug('Saved record with uuid: ', record.uuid);
                $state.go('record.list');
            }, function (error) {
                $log.debug('Error while creating record:', error);
            });
        }

        $scope.$on('$destroy', function() {
            // let map know to destroy its state
            $scope.$emit('driver.views.record:close');
        });
    }

    angular.module('driver.views.record')
    .controller('RecordAddEditController', RecordAddEditController);

})();

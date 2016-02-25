(function () {
    'use strict';

    /* ngInject */
    function RecordAddEditController($log, $scope, $state, $stateParams, $window, $q, uuid4,
                                     AuthService, Nominatim, Notifications, Records, RecordState,
                                     RecordSchemaState, RecordTypes, WeatherService, WebConfig) {
        var ctl = this;
        var editorData = null;
        var bbox = null;
        var suppressReverseNominatim = true;
        var timeZone = WebConfig.localization.timeZone;

        initialize();

        // Initialize for either adding or editing, depending on recorduuid being supplied
        function initialize() {
            ctl.fixOccurredDTForPickers = fixOccurredDTForPickers;
            ctl.goBack = goBack;
            ctl.onDataChange = onDataChange;
            ctl.onSaveClicked = onSaveClicked;
            ctl.onDateChanged = onDateChanged;
            ctl.onGeomChanged = onGeomChanged;
            ctl.nominatimLookup = nominatimLookup;
            ctl.nominatimSelect = nominatimSelect;
            ctl.openOccurredDatePicker = openOccurredDatePicker;

            ctl.userCanWrite = AuthService.hasWriteAccess();

            // This state attribute will be true when adding secondary records
            ctl.secondary = $state.current.secondary;

            // Only location text is currently being displayed in the UI. The other nominatim
            // values are only being stored. The variables have been placed on the controller
            // since we may want to display them at some point. These are some common fields
            // that are on many of the returned results, however not all are always present.
            ctl.nominatimLocationText = '';
            ctl.nominatimCity = '';
            ctl.nominatimCityDistrict = '';
            ctl.nominatimCounty = '';
            ctl.nominatimNeighborhood = '';
            ctl.nominatimRoad = '';
            ctl.nominatimState = '';

            ctl.constantFieldErrors = null;
            ctl.geom = {
                lat: null,
                lng: null
            };

            // Date picker state
            ctl.occurredDatePicker = {
                opened: false
            };

            $scope.$on('driver.views.record:marker-moved', function(event, data) {
                // update location when map marker set
                $scope.$apply(function() {
                    ctl.geom.lat = data[1];
                    ctl.geom.lng = data[0];
                });

                // update whether we have all constant fields or not
                constantFieldsValidationErrors();
            });

            $scope.$on('driver.views.record:map-moved', function(event, data) {
                bbox = data;
            });

            $scope.$watchCollection(function () { return ctl.geom; }, function (newVal) {
                if (newVal && newVal.lat && newVal.lng) {
                    if(!ctl.nominatimLocationText || !suppressReverseNominatim) {
                        Nominatim.reverse(newVal.lng, newVal.lat).then(function (nominatimData) {
                            /* jshint camelcase: false */
                            ctl.nominatimLocationText = nominatimData.display_name;
                            ctl.nominatimCity = nominatimData.address.city;
                            ctl.nominatimCityDistrict = nominatimData.address.city_district;
                            ctl.nominatimCounty = nominatimData.address.county;
                            ctl.nominatimNeighborhood = nominatimData.address.neighbourhood;
                            ctl.nominatimRoad = nominatimData.address.road;
                            ctl.nominatimState = nominatimData.address.state;
                            /* jshint camelcase: true */
                        });
                    } else {
                        suppressReverseNominatim = false;
                    }
                }
            });

            // If there's a record, load it first then get its schema.
            var schemaPromise;
            if ($stateParams.recorduuid) {
                schemaPromise = loadRecord().then(loadRecordSchema);
            } else {
                schemaPromise = loadRecordSchema();
            }

            schemaPromise.then(function () {
                // Suppress light and weather for Interventions
                if (!ctl.secondary) {
                    // Weather
                    ctl.lightValues = WeatherService.lightValues;
                    ctl.weatherValues = WeatherService.weatherValues;
                    ctl.weather = '';
                    ctl.light = '';
                }
                onSchemaReady();
            });
        }

        // Called when calendar icon of occurred date picker is pressed
        function openOccurredDatePicker() {
            ctl.occurredDatePicker.opened = true;
        }

        // tell embed-map-directive to update marker location
        function onGeomChanged(recenter) {
            if (ctl.geom.lat && ctl.geom.lng) {
                $scope.$emit('driver.views.record:location-selected', ctl.geom, recenter);
            }

            // update whether all constant fields are present
            constantFieldsValidationErrors();
        }

        /**
         * Since the date and time pickers rely on the browser's local timezone with
         * no way to override, we need to modify the occurred datetime before it gets
         * to the pickers. We want to show the datetime in the configured local tz,
         * so we need to apply offsets for both the browser's tz and the configured
         * local tz so it shows up as desired. This also needs to be undone before
         * sending data over to the server when saving this request. This is a hack,
         * but there's no clearly better way around it.
         *
         * @param {object} record The record object where occurred_to resides
         * @param {bool} reverse True if the fix is being reversed out of for saving purposes
         */
        function fixOccurredDTForPickers(reverse) {
            var occurredFromDT = new Date(ctl.occurredFrom);
            var browserTZOffset = occurredFromDT.getTimezoneOffset();
            var configuredTZOffset = moment(occurredFromDT).tz(timeZone)._offset;
            // Note that the native js getTimezoneOffset returns the opposite of what
            // you'd expect: i.e. EST which is UTC-5 gets returned as positive 5.
            // The `moment` method of returning the offset would return this as a -5.
            // Therefore if the browser tz is the same as the configured local tz,
            // the following offset will cancel out and return zero.
            var offset = (browserTZOffset + configuredTZOffset) * (reverse ? -1 : +1);

            occurredFromDT.setMinutes(occurredFromDT.getMinutes() + offset);
            ctl.occurredFrom = occurredFromDT;

            if (ctl.occurredTo) {
                var occurredToDT = new Date(ctl.occurredTo);
                occurredToDT.setMinutes(occurredToDT.getMinutes() + offset);
                ctl.occurredTo = occurredToDT;
            }
        }

        // Helper for loading the record -- only used when in edit mode
        function loadRecord() {
            return Records.get({ id: $stateParams.recorduuid })
                .$promise.then(function(record) {
                    ctl.record = record;

                    /* jshint camelcase: false */
                    ctl.occurredFrom = ctl.record.occurred_from;
                    ctl.occurredTo = ctl.record.occurred_to;
                    // Prep the occurred_from datetime for use with pickers
                    fixOccurredDTForPickers(false);

                    // set lat/lng array into bind-able object
                    ctl.geom.lat = ctl.record.geom.coordinates[1];
                    ctl.geom.lng = ctl.record.geom.coordinates[0];
                    ctl.nominatimLocationText = ctl.record.location_text;
                    ctl.nominatimCity = ctl.record.city;
                    ctl.nominatimCityDistrict = ctl.record.city_district;
                    ctl.nominatimCounty = ctl.record.county;
                    ctl.nominatimNeighborhood = ctl.record.neighborhood;
                    ctl.nominatimRoad = ctl.record.road;
                    ctl.nominatimState = ctl.record.state;
                    ctl.weather = ctl.record.weather;
                    ctl.light = ctl.record.light;
                    /* jshint camelcase: true */

                    // notify map
                    onGeomChanged(false);
                });
        }

        /* Loads the right schema:
         * -If there's a record, loads the latest schema for the record's type, checking whether
         *  it matches the secondary type and setting ctl.secondary to true if so.
         * -Othersise, loads either the latest schema for either the primary or the secondary
         *  record type, depending on whether ctl.secondary is true.
         * If no record type loads (e.g. if someone is trying to add a secondary record but has
         * no secondary recordType), sets an error and returns a rejected promise.
         */
        function loadRecordSchema() {
            var typePromise;
            if (ctl.record) {
                typePromise = RecordTypes.query({ record: ctl.record.uuid }).$promise
                    .then(function (result) {
                        var recordType = result[0];
                        RecordState.getSecondary().then(function (secondaryType) {
                            if (!!secondaryType && secondaryType.uuid === recordType.uuid) {
                                ctl.secondary = true;
                            }
                        });
                        return recordType;
                    });
            } else if (ctl.secondary) {
                typePromise = RecordState.getSecondary();
            } else {
                typePromise = RecordState.getSelected();
            }
            return typePromise.then(function (recordType) {
                if (recordType) {
                    ctl.recordType = recordType;
                    /* jshint camelcase: false */
                    return RecordSchemaState.get(ctl.recordType.current_schema)
                    /* jshint camelcase: true */
                        .then(function(recordSchema) { ctl.recordSchema = recordSchema; });
                } else {
                    ctl.error = 'Unable to load record schema.';
                    return $q.reject(ctl.error);
                }
            });
        }

        function onDateChanged() {
            // update whether all constant fields are present
            constantFieldsValidationErrors();
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

        function nominatimLookup(text) {
            return Nominatim.forward(text, bbox);
        }

        function nominatimSelect(item) {
            // a change to ctl.geom will trigger a reverse nominatim lookup,
            // so supress it
            suppressReverseNominatim = true;
            // if the same location is looked up twice, the suppress flag won't be
            // reset and the next reverse lookup will be ignored, so reset it after 500ms
            _.delay(function () { suppressReverseNominatim = false; }, 500);
            ctl.geom.lat = parseFloat(item.lat);
            ctl.geom.lng = parseFloat(item.lon);

            // notify map
            onGeomChanged(true);
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
                    disable_array_reorder: false,
                    collapsed: true,
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

        /* Validate the constant value fields, which are not handled by json-editor.
         *
         * @returns {String} error message, which is empty if there are no errors
         */
        function constantFieldsValidationErrors() {
            var required = {
                'latitude': ctl.geom.lat,
                'longitude': ctl.geom.lng,
                'occurred': ctl.occurredFrom
            };

            ctl.constantFieldErrors = {};
            angular.forEach(required, function(value, fieldName) {
                if (!value) {
                    // message formatted to match errors from json-editor
                    ctl.constantFieldErrors[fieldName] = fieldName + ': Value required';
                }
            });
            if (ctl.secondary && ctl.occurredFrom && ctl.occurredTo &&
                    ctl.occurredFrom > ctl.occurredTo) {
                ctl.constantFieldErrors.occurredTo = 'End date cannot be before start date.';
            }

            // make field errors falsy if empty, for partial to check easily
            if (Object.keys(ctl.constantFieldErrors).length === 0) {
                ctl.constantFieldErrors = null;
                return '';
            } else {
                var errors = _.map(ctl.constantFieldErrors, function(message) {
                    return '<p>' + message + '</p>';
                });
                return errors.join('');
            }
        }

        function goBack() {
            $window.history.back();
        }

        function onSaveClicked() {
            var validationErrorMessage = constantFieldsValidationErrors();

            if (ctl.editor.errors.length > 0) {
                $log.debug('json-editor errors on save:', ctl.editor.errors);
                // Errors array has objects each with message, path, and property,
                // where path looks like 'root.Thing Details.Stuff',
                // property like 'minLength'
                // and message like 'Value required'.
                // Show error as 'Stuff: Value required'
                ctl.editor.errors.forEach(function(err) {
                    // strip the field name from the end of the path
                    var fieldName = err.path.substring(err.path.lastIndexOf('.') + 1);
                    validationErrorMessage += ['<p>',
                        fieldName,
                        ': ',
                        err.message,
                        '</p>'
                    ].join('');
                });
                showErrorNotification(validationErrorMessage);
                return;
            } else if (validationErrorMessage.length > 0) {
                // have constant field errors only
                showErrorNotification(validationErrorMessage);
                return;
            }

            // If there is already a record, set the new editorData and update, else create one
            var saveMethod = null;
            var dataToSave = null;

            // If editing a primary record (where we don't ask for 'to' date) or if 'to' date is
            // blank, set it to be the same as 'from' date.
            if (!ctl.secondary || !ctl.occurredTo) {
                ctl.occurredTo = ctl.occurredFrom;
            }

            // Reverse the date and time picker timezone fix to get back to the actual correct time
            fixOccurredDTForPickers(true);

            /* jshint camelcase: false */
            if (ctl.record && ctl.record.geom) {
                // set back coordinates and nominatim values
                ctl.record.geom.coordinates = [ctl.geom.lng, ctl.geom.lat];
                ctl.record.location_text = ctl.nominatimLocationText;
                ctl.record.city = ctl.nominatimCity;
                ctl.record.city_district = ctl.nominatimCityDistrict;
                ctl.record.county = ctl.nominatimCounty;
                ctl.record.neighborhood = ctl.nominatimNeighborhood;
                ctl.record.road = ctl.nominatimRoad;
                ctl.record.state = ctl.nominatimState;
                ctl.record.weather = ctl.weather;
                ctl.record.light = ctl.light;
                ctl.record.occurred_from = ctl.occurredFrom;
                ctl.record.occurred_to = ctl.occurredTo;

                saveMethod = 'update';
                dataToSave = ctl.record;
                dataToSave.data = editorData;
            } else {
                saveMethod = 'create';
                dataToSave = {
                    data: editorData,
                    schema: ctl.recordSchema.uuid,

                    // constant fields
                    geom: 'POINT(' + ctl.geom.lng + ' ' + ctl.geom.lat + ')',
                    location_text: ctl.nominatimLocationText,
                    city: ctl.nominatimCity,
                    city_district: ctl.nominatimCityDistrict,
                    county: ctl.nominatimCounty,
                    neighborhood: ctl.nominatimNeighborhood,
                    road: ctl.nominatimRoad,
                    state: ctl.nominatimState,
                    weather: ctl.weather,
                    light: ctl.light,

                    occurred_from: ctl.occurredFrom,
                    occurred_to: ctl.occurredTo
                };
            }
            /* jshint camelcase: true */

            Records[saveMethod](dataToSave, function (record) {
                $log.debug('Saved record with uuid: ', record.uuid);
                $state.go('record.list');
            }, function (error) {
                $log.debug('Error while creating record:', error);
                showErrorNotification(['<p>Error creating record</p><p>',
                   error.status,
                   ': ',
                   error.statusText,
                   '</p>'
                ].join(''));
            });
        }

        // helper to display errors when form fails to save
        function showErrorNotification(message) {
            Notifications.show({
                displayClass: 'alert-danger',
                header: 'Record Not Saved',
                html: message
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

(function () {
    'use strict';

    /* ngInject */
    function RTAddController($log, $scope, $state, RecordSchemas, RecordTypes, Schemas) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.recordType = {};
            ctl.submitForm = submitForm;
        }

        /*
         * Creates the record type and switches to the list view on success
         */
        function submitForm() {
            RecordTypes.create(ctl.recordType, onRecordTypeCreateSuccess, function(error) {
                $log.debug('Error while adding recordType: ', error);
            });
        }

        /**
         * Create blank associated record schema v1 on record type create success
         * @return {[type]} [description]
         */
        function onRecordTypeCreateSuccess(recordType) {
            $scope.$emit('ase.recordtypes.changed');

            // Automatically add 'Details' related content type to all record types
            var schema = Schemas.JsonObject();
            schema = Schemas.addVersion4Declaration(schema); // Make root object a "real" JSON-Schema
            var definition = Schemas.JsonObject();
            definition.details = true; // Flag denoting that this is the 'details' definition
            definition.description = 'Details for ' + recordType.label;
            definition.multiple = false;
            definition.propertyOrder = 0; // make details section first; others default to 1,000
            /* jshint camelcase: false */
            definition.title = definition.plural_title = recordType.label + ' Details';
            /* jshint camelcase: true */
            var key = Schemas.generateFieldName(definition.title);
            schema.definitions[key] = definition;
            schema.properties[key] = {
                $ref: '#/definitions/' + encodeURIComponent(key),

                // Set the collapsed option of the details option to true so it starts collapsed
                options: {
                    collapsed: true
                }
            };

            RecordSchemas.create({
                /* jshint camelcase: false */
                record_type: recordType.uuid,
                schema: schema
                /* jshint camelcase: true */
            }).$promise.then(function () {
                $state.go('rt.list');
            }, function (error) {
                $log.debug('Error while creating recordschema:', error);
            });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTAddController', RTAddController);
})();

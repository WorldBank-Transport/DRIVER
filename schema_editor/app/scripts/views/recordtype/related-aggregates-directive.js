(function() {
    'use strict';

    /* ngInject */
    function RTRelatedAggregatesController(
        $state, $scope, $stateParams, Schemas, RecordTypes, RecordSchemas, RecordCosts,
        Notifications
    ) {
        var ctl = this;
        ctl.$onInit = onInit;

        function onInit() {
            // functions
            ctl.submitForm = submitForm;
            ctl.populatePropertyKeys = populatePropertyKeys;
            ctl.populateEnumFields = populateEnumFields;
            ctl.reset = reset;

            // data
            ctl.selectedContentType = {};
            ctl.selectedPropertyKey = {};
            ctl.definitions = {};

            getRecordTypes()
                .then(initRecordTypes)
                .then(initRecordSchema)
                .then(initRecordCosts);
        }

        function getRecordTypes() {
            return RecordTypes.get({id: $stateParams.uuid}).$promise;
        }

        function initRecordTypes(response) {
            ctl.recordType = response;
            /* jshint camelcase: false */
            return RecordSchemas.get({
                id: ctl.recordType.current_schema
            }).$promise;
            /* jshint camelcase: true */
        }

        function initRecordSchema(recordSchema) {
            ctl.definitions = recordSchema.schema.definitions;
            setDefinitions(ctl.definitions);
            /* jshint camelcase: false */
            return RecordCosts.query({
                    record_type: recordSchema.record_type,
                    limit: 1,
                    ordering: '-modified'
                }).$promise;
            /* jshint camelcase: true */
        }

        function initRecordCosts(recordCosts) {
            var recordcost = recordCosts[0];
            if (!recordcost) {
                return;
            }

            /* jshint camelcase: false */
            ctl.selectedContentType = _.filter(
                ctl.contentDefinitions,
                function(definition) {
                    return definition.contentTypeKey === recordcost.content_type_key;
                })[0];

            ctl.populatePropertyKeys();
            ctl.selectedPropertyKey = _.filter(
                ctl.contentPropertyPairs,
                function(pair) {
                    return pair.propertyKey === recordcost.property_key;
                })[0];
            ctl.costPrefix = recordcost.cost_prefix;
            ctl.costSuffix = recordcost.cost_suffix;

            ctl.populateEnumFields();
            _.forEach(ctl.enumFields, function(enumField) {
                enumField.value = recordcost.enum_costs[enumField.field];
            });
            /* jshint camelcase: true */
        }

        function reset() {
            $state.go($state.current, {}, {
                reload: true
            });
        }

        function setDefinitions(definitions) {
            var defPairs = _.chain(definitions).map(function(val, key) {
                return {
                    contentTypeKey: key,
                    definition: val
                };
            }).filter(function(pair) {
                return !pair.definition.multiple;
            }).value();
            ctl.contentDefinitions = defPairs;
            if (ctl.contentDefinitions.length === 1 && !ctl.selectedContentType.selectedContentType) {
                ctl.selectedContentType = ctl.contentDefinitions[0];
                populatePropertyKeys();
            }
        }

        function populatePropertyKeys() {
            var propPairs = _.chain(ctl.selectedContentType.definition.properties).map(function(val, key) {
                return {
                    propertyKey: key,
                    property: val
                };
            }).filter(function(pair) {
                return pair.property.fieldType === 'selectlist';
            }).value();
            ctl.contentPropertyPairs = propPairs;
            if (ctl.contentPropertyPairs.length === 1) {
                ctl.selectedPropertyKey = ctl.contentPropertyPairs[0];
                populateEnumFields();
            }
        }

        function populateEnumFields() {
            var fields = ctl.selectedPropertyKey.property.enum || ctl.selectedPropertyKey.property.items.enum;
            ctl.enumFields = [];
            _.forEach(fields, function(enumField) {
                ctl.enumFields.push({
                    field: enumField,
                    value: 0
                });
            });
        }


        //public functions
        function submitForm() {
            /* jshint camelcase:false */
            var recordcost = {
                content_type_key: ctl.selectedContentType.contentTypeKey,
                property_key: ctl.selectedPropertyKey.propertyKey,
                cost_prefix: ctl.costPrefix,
                cost_suffix: ctl.costSuffix,
                enum_costs: {},
                record_type: $stateParams.uuid
            };
            _.forEach(ctl.enumFields, function(enumField) {
                recordcost.enum_costs[enumField.field] = enumField.value;
            });
            /* jshint camelcase:true */
            RecordCosts.create(
                recordcost,
                function() {
                    Notifications.show({
                        displayClass: 'alert-success',
                        text: 'Save successful',
                        timeout: 3000
                    });
                },
                function() {
                    Notifications.show({
                        displayClass: 'alert-danger',
                        text: 'There was an error while saving',
                        timeout: 3000
                    });
                });
        }

        //helper functions
    }

    /* ngInject */
    function RTRelatedAggregates() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/related-aggregates-partial.html',
            controller: 'RTRelatedAggregateController',
            controllerAs: 'rtRelated',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
        .controller('RTRelatedAggregateController', RTRelatedAggregatesController)
        .directive('aseRtRelatedAggregates', RTRelatedAggregates);
})();

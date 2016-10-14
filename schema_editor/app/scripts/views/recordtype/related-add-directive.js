
(function () {
    'use strict';

    /* ngInject */
    function RTRelatedAddController($log, $state, $stateParams, RecordSchemas, RecordTypes, Schemas) {
        var ctl = this;
        ctl.submitForm = submitForm;
        initialize();

        function initialize() {
            ctl.definition = Schemas.JsonObject();
            ctl.definition = Schemas.addRelatedContentFields(ctl.definition);
            RecordTypes.get({ id: $stateParams.uuid }).$promise.then(function (data) {
                ctl.recordType = data;
                /* jshint camelcase:false */
                ctl.currentSchema = RecordSchemas.get({ id: ctl.recordType.current_schema });
                /* jshint camelcase:true */
            });
        }

        /**
         * Updates related definitions to include a property order attribute
         * @param {object} properties to update propertyOrder attribute
         */
        function addPropertyOrder(properties) {
            var currentPropertyOrder = 0;
            _.mapValues(properties, function(property) {
                var propertyOrder = property.propertyOrder;
                if (propertyOrder && propertyOrder > currentPropertyOrder) {
                    currentPropertyOrder = propertyOrder;
                }
            });

            _.forEach(properties, function(property) {
                if (!property.propertyOrder && property.propertyOrder !== 0) {
                    currentPropertyOrder = currentPropertyOrder + 1;
                    property.propertyOrder = currentPropertyOrder;
                }
            });
        }

        function submitForm() {
            var key = Schemas.generateFieldName(ctl.definition.title);
            if (ctl.currentSchema.schema.definitions[key]) {
                $log.debug('Title', key, 'exists for current schema');
                return;
            }

            ctl.currentSchema.schema.definitions[key] = ctl.definition;

            // Use an array or object depending on the 'multiple' setting
            var ref = '#/definitions/' + encodeURIComponent(key);
            if (ctl.definition.multiple) {
                ctl.currentSchema.schema.properties[key] = {
                    type: 'array',
                    items: {
                        $ref: ref
                    },
                    title: ctl.definition.title,
                    /* jshint camelcase:false */
                    plural_title: ctl.definition.plural_title
                    /* jshint camelcase:true */
                };
            } else {
                ctl.currentSchema.schema.properties[key] = {
                    $ref: ref
                };
            }

            // Set the collapsed option to true so all objects start collapsed when viewing
            ctl.currentSchema.schema.properties[key].options = {
                collapsed: true
            };

            addPropertyOrder(ctl.currentSchema.schema.properties);

            RecordSchemas.create({
                /* jshint camelcase:false */
                schema: ctl.currentSchema.schema,
                record_type: ctl.recordType.uuid
                /* jshint camelcase:true */
            }, function () {
                $state.go('rt.related', {uuid: ctl.recordType.uuid});
            }, function (error) {
                $log.debug('Error saving new schema: ', error);
            });
        }
    }

    /* ngInject */
    function RTRelatedAdd() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/related-add-edit-partial.html',
            controller: 'RTRelatedAddController',
            controllerAs: 'rtRelated',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .controller('RTRelatedAddController', RTRelatedAddController)
    .directive('aseRtRelatedAdd', RTRelatedAdd);

})();

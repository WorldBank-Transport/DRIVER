
(function () {
    'use strict';

    /* ngInject */
    function RTRelatedEditController($log, $state, $stateParams, RecordSchemas, RecordTypes, Schemas) {
        var ctl = this;
        var currentSchema = null;
        ctl.submitForm = submitForm;
        initialize();

        function initialize() {
            ctl.schemaKey = $stateParams.schema;
            ctl.definition = {};
            RecordTypes.get({ id: $stateParams.uuid }).$promise.then(function (data) {
                ctl.recordType = data;
                /* jshint camelcase: false */
                RecordSchemas.get({ id: ctl.recordType.current_schema }).$promise.then(function (recordSchema) {
                /* jshint camelcase: true */
                    currentSchema = recordSchema;
                    ctl.definition = currentSchema.schema.definitions[ctl.schemaKey];
                });
            });
        }

        function submitForm() {
            var key = Schemas.generateFieldName(ctl.definition.title);
            currentSchema.schema.definitions[key] = ctl.definition;
            RecordSchemas.create({
                /* jshint camelcase: false */
                schema: currentSchema.schema,
                record_type: ctl.recordType.uuid
                /* jshint camelcase: true */
            }, function () {
                $state.go('^.related', {uuid: ctl.recordType.uuid});
            }, function (error) {
                $log.debug('Error saving new schema: ', error);
            });
        }
    }

    /* ngInject */
    function RTRelatedEdit() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/related-add-edit-partial.html',
            controller: 'RTRelatedEditController',
            controllerAs: 'rtRelated',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .controller('RTRelatedEditController', RTRelatedEditController)
    .directive('aseRtRelatedEdit', RTRelatedEdit);

})();

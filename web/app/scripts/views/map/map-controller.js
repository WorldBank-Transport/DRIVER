(function () {
    'use strict';

    /* ngInject */
    function MapController($scope, Records, RecordSchemas, RecordState) {
        var ctl = this;

        initialize();

        // TODO: This also needs to listen for changing filters, both from the filterbar and map.
        // This hasn't been done here, because of a couple related, in-progress tasks.
        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            ctl.recordType = selected;
            loadRecords();
        });

        function initialize() {
            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(loadRecordSchema)
                .then(loadRecords);
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

        function loadRecords() {
            /* jshint camelcase: false */
            var params = { record_type: ctl.recordType.uuid,
                           limit: 50 };
            /* jshint camelcase: true */

            Records.toddow().$promise.then(function(toddowData) {
                ctl.toddow = toddowData;
            });

            return Records.get(params)
                .$promise.then(function(records) {
                    ctl.records = records.results;
                });
        }
    }

    angular.module('driver.views.map')
    .controller('MapController', MapController);

})();

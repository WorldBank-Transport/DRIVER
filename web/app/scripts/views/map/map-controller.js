(function () {
    'use strict';

    /* ngInject */
    function MapController($rootScope, $scope, BoundaryState, InitialState, FilterState,
                           Records, RecordSchemas, RecordState, RecordAggregates) {
        var ctl = this;

        InitialState.ready().then(init);

        function init() {
            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(BoundaryState.getSelected().then(function(selected) {
                    ctl.boundaryId = selected.uuid;
                }))
                .then(loadRecordSchema)
                .then(loadRecords);

            // TODO: This also needs to listen for changing filters, both from the filterbar
            // and map. This hasn't been done here, because of a couple related, in-progress tasks.
            $scope.$on('driver.state.recordstate:selected', function(event, selected) {
                ctl.recordType = selected;
                loadRecords();
            });

            $rootScope.$on('driver.filterbar:changed', function() {
                loadRecords();
            });

            $scope.$on('driver.state.boundarystate:selected', function(event, selected) {
                ctl.boundaryId = selected.uuid;
                loadRecords();
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

        function loadRecords() {
            /* jshint camelcase: false */
            var params = ctl.boundaryId ? { polygon_id: ctl.boundaryId } : {};
            /* jshint camelcase: true */

            RecordAggregates.stepwise(true, params).then(function(stepwiseData) {
                // minDate and maxDate are important for determining where the barchart begins/ends
                ctl.minDate = null;
                ctl.maxDate = null;
                if (FilterState.filters.hasOwnProperty('__dateRange')) {
                    if (FilterState.filters.__dateRange.hasOwnProperty('min')) {
                        ctl.minDate = FilterState.filters.__dateRange.min;
                    }
                    if (FilterState.filters.__dateRange.hasOwnProperty('max')) {
                        ctl.maxDate = FilterState.filters.__dateRange.max;
                    }
                }
                ctl.stepwise = stepwiseData;
            });

            RecordAggregates.toddow(true, params).then(function(toddowData) {
                ctl.toddow = toddowData;
            });
        }
    }

    angular.module('driver.views.map')
    .controller('MapController', MapController);

})();

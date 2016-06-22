(function () {
    'use strict';

    /* ngInject */
    function MapController($rootScope, $scope, $modal, AuthService, BoundaryState,
                           WebConfig, InitialState, FilterState, Records, RecordTypes,
                           RecordState, RecordSchemaState, MapState, RecordAggregates) {
        var ctl = this;
        ctl.userCanWrite = false;
        ctl.showInterventions = WebConfig.interventions.visible;
        ctl.showBlackSpots = WebConfig.blackSpots.visible;

        /** This is one half of some fairly ugly code which serves to wire up a click
         *  handling event on top of some dynamically generated HTML. The other half is in
         *  views/map/layers-controller.js.
         *
         *  This half has the code that needs to be on scope for linking
         */
        $scope.showDetailsModal = function showDetailsModal(recordUUID) {
            RecordTypes.query({ record: recordUUID }).$promise
                .then(function (result) {
                    var recordType = result[0];
                    /* jshint camelcase: false */
                    RecordSchemaState.get(recordType.current_schema)
                    /* jshint camelcase: true */
                        .then(function(recordSchema) {
                            $modal.open({
                                templateUrl: 'scripts/views/record/details-modal-partial.html',
                                controller: 'RecordDetailsModalController as modal',
                                size: 'lg',
                                resolve: {
                                    /* jshint camelcase: false */
                                    record: function() {
                                        return Records.get({
                                            id: recordUUID,
                                            details_only: 'True'
                                        }).$promise;
                                    },
                                    /* jshint camelcase: true */
                                    recordType: function () {
                                        return recordType;
                                    },
                                    recordSchema: function () {
                                        return recordSchema;
                                    },
                                    userCanWrite: function() {
                                        return ctl.userCanWrite;
                                    }
                                }
                            });

                        });
                });
        };

        InitialState.ready().then(init);

        function init() {
            ctl.userCanWrite = AuthService.hasWriteAccess();

            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
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

            $scope.$on('driver.state.boundarystate:selected', function() {
                loadRecords();
            });
        }

        function loadRecords() {
            /* jshint camelcase: false */
            var params = {};

            /* jshint camelcase: true */
            var userDrawnPoly = MapState.getFilterGeoJSON();
            if (userDrawnPoly) {
                params.polygon = userDrawnPoly;
            }

            ctl.recordQueryParams = params;

            RecordAggregates.stepwise(params).then(function(stepwiseData) {
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

            RecordAggregates.toddow(params).then(function(toddowData) {
                ctl.toddow = toddowData;
            });

            RecordAggregates.socialCosts(params).then(
                function(costs) {
                    ctl.socialCosts = costs;
                },
                function(error) {
                    ctl.socialCosts = error;
                }
            );
        }
    }

    angular.module('driver.views.map')
    .controller('MapController', MapController);

})();

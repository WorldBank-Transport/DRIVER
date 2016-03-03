(function () {
    'use strict';

    /**
     * Handles the interaction for intervention adding and exports.
     * Applies date and geography filters.
     */

    /* ngInject */
    function InterventionsController($rootScope, $scope, $interval, RecordState,
                                     InitialState, QueryBuilder, Exports) {
        var ctl = this;
        var pollingInterval;
        var POLLING_INTERVAL_MS = 1500;
        var MAX_POLLING_TIME_S = 100;

        InitialState.ready().then(initialize);

        function initialize() {
            ctl.isOpen = false;
            ctl.pending = false;
            ctl.downloadURL = null;
            ctl.error = null;

            ctl.toggle = toggle;
            ctl.exportCSV = exportCSV;

            RecordState.getSecondary().then(function (secondaryType) {
                ctl.recordType = secondaryType;
            });
        }

        function toggle() {
            ctl.isOpen = !ctl.isOpen;
            if (ctl.isOpen) {
                $rootScope.$broadcast('driver.tools.interventions.open');
            }
        }

        $scope.$on('driver.tools.charts.open', function () { ctl.isOpen = false; });
        $scope.$on('driver.tools.export.open', function () { ctl.isOpen = false; });

        function exportCSV() {
            cancelPolling();
            ctl.error = null;
            ctl.downloadURL = null;

            /* jshint camelcase: false */
            var params = _.extend({ tilekey: true, record_type: ctl.recordType.uuid },
                                  ctl.recordQueryParams);
            /* jshint camelcase: true */
            // Get a tilekey then trigger an export
            QueryBuilder.djangoQuery(0, params).then(function(records) {
                Exports.create({ tilekey: records.tilekey },
                    function (result) { pollForDownload(result.taskid); },
                    function () { ctl.error = 'Error initializing export.'; }
                );
            });
        }

        function pollForDownload(taskID) {
            ctl.pending = true;
            pollingInterval = $interval(function () {
                    Exports.get({ id: taskID }).$promise.then(function (response) {
                        switch (response.status) {
                            case 'PENDING':
                            case 'STARTED':
                                break;
                            case 'FAILURE':
                                ctl.error = response.error;
                                cancelPolling();
                                break;
                            case 'SUCCESS':
                                ctl.downloadURL = response.result;
                                cancelPolling();
                                break;
                        }
                    });
                },
                POLLING_INTERVAL_MS,
                MAX_POLLING_TIME_S * 1000 / POLLING_INTERVAL_MS
            );
            // The interval's promise resolves if it hits the limit without being cancelled
            pollingInterval.then(function () {
                cancelPolling();
                ctl.error = 'Export request timed out.';
            });
        }

        function cancelPolling() {
            ctl.pending = false;
            $interval.cancel(pollingInterval);
        }

        $scope.$on('$destroy', cancelPolling);
    }

    angular.module('driver.tools.interventions')
    .controller('InterventionsController', InterventionsController);

})();

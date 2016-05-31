(function () {
    'use strict';

    /**
     * Handles the interaction for CSV exports and custom report generation.
     * Uses filter query parameters provided by MapController.
     *
     * For CSV exports - makes a request to start an export job then polls
     * for the result and provides the link.
     *
     * For custom reports - displays a modal to configure the report then
     * opens up the report in a new window.
     */

    /* ngInject */
    function ExportController($modal, $rootScope, $scope, RecordExports, InitialState,
                              QueryBuilder) {
        var ctl = this;

        InitialState.ready().then(initialize);

        function initialize() {
            ctl.isOpen = false;
            ctl.pending = false;
            ctl.downloadURL = null;
            ctl.error = null;

            ctl.toggle = toggle;
            ctl.exportCSV = exportCSV;
            ctl.showCustomReportsModal = showCustomReportsModal;
        }

        function toggle() {
            ctl.isOpen = !ctl.isOpen;
            if (ctl.isOpen) {
                $rootScope.$broadcast('driver.tools.export.open');
            }
        }

        $scope.$on('driver.tools.charts.open', function () { ctl.isOpen = false; });
        $scope.$on('driver.tools.interventions.open', function () { ctl.isOpen = false; });
        $scope.$on('driver.tools.costs.open', function () { ctl.isOpen = false; });

        function exportCSV() {
            RecordExports.cancelPolling();
            ctl.error = null;
            ctl.downloadURL = null;
            ctl.pending = true;

            var params = _.extend({ tilekey: true, limit: 0 }, ctl.recordQueryParams);
            // Get a tilekey then trigger an export
            QueryBuilder.djangoQuery(0, params).then(function(records) {
                RecordExports.exportCSV(records.tilekey).promise.then(
                    function (result) { ctl.downloadURL = result; },
                    function (error) { ctl.error = error; }
                ).finally(function() { ctl.pending = false; });
            });
        }

        // Shows the custom reports modal
        function showCustomReportsModal() {
            $modal.open({
                templateUrl: 'scripts/custom-reports/custom-reports-modal-partial.html',
                controller: 'CustomReportsModalController as modal'
            });
        }

        $scope.$on('$destroy', RecordExports.cancelPolling);
    }

    angular.module('driver.tools.export')
    .controller('ExportController', ExportController);

})();

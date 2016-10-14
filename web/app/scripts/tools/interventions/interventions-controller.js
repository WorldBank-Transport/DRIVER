(function () {
    'use strict';

    /**
     * Handles the interaction for intervention adding and exports.
     * Applies date and geography filters to export.
     */

    /* ngInject */
    function InterventionsController($rootScope, $scope, RecordState, InitialState, QueryBuilder,
                                     RecordExports) {
        var ctl = this;

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
        $scope.$on('driver.tools.costs.open', function () { ctl.isOpen = false; });

        function exportCSV() {
            RecordExports.cancelPolling();
            ctl.error = null;
            ctl.downloadURL = null;
            ctl.pending = true;

            /* jshint camelcase: false */
            var params = _.extend({ tilekey: true, record_type: ctl.recordType.uuid },
                                  ctl.recordQueryParams);
            /* jshint camelcase: true */
            // Get a tilekey then trigger an export
            QueryBuilder.djangoQuery(0, params, {doJsonFilters: false}, true).then(
                function(records) {
                    RecordExports.exportCSV(records.tilekey).promise.then(
                        function (result) { ctl.downloadURL = result; },
                        function (error) { ctl.error = error; }
                    ).finally(function() { ctl.pending = false; });
                }
            );
        }

        $scope.$on('$destroy', RecordExports.cancelPolling);
    }

    angular.module('driver.tools.interventions')
    .controller('InterventionsController', InterventionsController);

})();

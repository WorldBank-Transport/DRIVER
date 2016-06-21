(function () {
    'use strict';

    /**
     * Handles creating enforcement assignments
     * Uses filter query parameters provided by MapController.
     *
     * Displays a modal to configure the assignments and then opens the assignments
     * in a new window.
     */

    /* ngInject */
    function EnforcersToolController($modal, $rootScope, $scope, RecordExports, InitialState) {
        var ctl = this;

        InitialState.ready().then(initialize);

        function initialize() {
            ctl.showEnforcementModal = showEnforcementModal;
        }

        // Shows the custom reports modal
        function showEnforcementModal() {
            $modal.open({
                templateUrl: 'scripts/enforcers/enforcers-modal-partial.html',
                controller: 'EnforcersModalController as modal'
            });
        }

    }

    angular.module('driver.tools.enforcers')
    .controller('EnforcersToolController', EnforcersToolController);

})();

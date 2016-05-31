(function () {
    'use strict';

    /* ngInject */
    function NotificationsController($scope, $timeout, Notifications) {
        var ctl = this;
        var alertTimeout = null;
        initialize();

        function initialize() {
            ctl.alert = {};
            ctl.alertHeight = 0;
            ctl.hideAlert = hideAlert;

            $scope.$on('ase.notifications.show', showAlert);

            function showAlert(event, alert) {
                ctl.alert = alert;
                ctl.active = true;
                if (alert.timeout) {
                    alertTimeout = $timeout(hideAlert, alert.timeout);
                }
            }

            function hideAlert() {
                ctl.active = false;
                if (alertTimeout) {
                    $timeout.cancel(alertTimeout);
                    alertTimeout = null;
                    ctl.alert = null;
                }
                // clear notification in service as well
                Notifications.hide();
            }

            if (Notifications.activeAlert()) {
                showAlert(null, Notifications.activeAlert());
            }
        }
    }

    angular.module('ase.notifications')
    .controller('NotificationsController', NotificationsController);

})();

(function () {
    'use strict';

    /* ngInject */
    function Notifications() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/notifications/notifications-partial.html',
            controller: 'NotificationsController',
            controllerAs: 'ntf',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.notifications')
    .directive('aseNotifications', Notifications);

})();

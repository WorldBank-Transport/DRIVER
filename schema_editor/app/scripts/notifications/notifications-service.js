(function () {
    'use strict';

    /* ngInject */
    function Notifications($rootScope, $timeout) {

        var timeoutId = null;
        var active = null;

        var module = {
            hide: hide,
            show: show,
            activeAlert: activeAlert
        };

        return module;

        /**
         * Provide the currently active alert.
         * Allows directives to display the active alert even if they miss the relevant event
         * @return the currently active alert
         */
        function activeAlert() {
            return active;
        }

        /**
         * Hide a global notification
         */
        function hide() {
            if (timeoutId) {
                $timeout.cancel(timeoutId);
                timeoutId = null;
            }
            active = null;
        }

        /**
         * Show a global notification, overridding the defaults defined in the function
         * @param  {object} options Override the defaults with this config
         * @return Broadcasts ase.notifications.show on $rootScope
         */
        function show(options) {
            var defaults = {
                timeout: 0,
                closeButton: true,
                html: '',
                text: '',
                imageClass: 'glyphicon-warning-sign',
                displayClass: 'alert-info'
            };
            var opts = angular.extend({}, defaults, options);
            active = opts;
            $rootScope.$broadcast('ase.notifications.show', opts);
        }
    }

    angular.module('ase.notifications')
    .factory('Notifications', Notifications);

})();

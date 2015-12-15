(function () {
    'use strict';

    /* ngInject */
    function UserDetailsController($log, $stateParams, AuthService, UserService) {
        var ctl = this;
        ctl.user = {};
        initialize();

        function initialize() {
            $log.debug('details controller: initialize!');
            getUserInfo();
        }

        // Helper for loading the user info
        function getUserInfo() {
            $log.debug('have user ID:');
            $log.debug($stateParams.userid);

            UserService.getUser($stateParams.userid).then(function(userInfo) {
                ctl.user = userInfo;

                $log.debug('got user info:');
                $log.debug(ctl.userInfo);

                ctl.user.token = AuthService.getToken();
            });
        }
    }

    angular.module('ase.views.usermgmt')
    .controller('UserDetailsController', UserDetailsController);
})();

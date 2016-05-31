(function () {
    'use strict';

    /* ngInject */
    function UserDetailsController($stateParams, AuthService, UserService) {
        var ctl = this;
        ctl.user = {};
        initialize();

        function initialize() {
            getUserInfo();
        }

        // Helper for loading the user info
        function getUserInfo() {
            UserService.getUser($stateParams.userid).then(function(userInfo) {
                ctl.user = userInfo;
                ctl.user.token = AuthService.getToken();
            });
        }
    }

    angular.module('ase.views.usermgmt')
    .controller('UserDetailsController', UserDetailsController);
})();

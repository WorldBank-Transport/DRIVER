(function () {
    'use strict';

    /* ngInject */
    function ASENavbarController($rootScope, $scope, $state, AuthService) {
        var ctl = this;

        ctl.onLogoutButtonClicked = AuthService.logout;
        ctl.authenticated = AuthService.isAuthenticated();

        $rootScope.$on('$stateChangeSuccess', function() {
            ctl.authenticated = AuthService.isAuthenticated();
        });
    }

    angular.module('ase.navbar')
    .controller('ASENavbarController', ASENavbarController);

})();

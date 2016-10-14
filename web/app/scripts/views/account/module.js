(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('account', {
            url: '/account',
            label: 'NAV.ACCOUNT',
            templateUrl: 'scripts/views/account/account-partial.html',
            controller: 'AccountController',
            showInNavbar: false,
            resolve: {
                UserInfo: function($log, AuthService, UserService) {
                    return UserService.getUser(AuthService.getUserId());
                }
            }
        });
    }

    angular.module('driver.views.account', [
        'ui.router',
        'ui.bootstrap',
        'ase.auth',
        'ase.userdata'
    ]).config(StateConfig);

})();

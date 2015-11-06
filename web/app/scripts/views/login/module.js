(function () {
'use strict';

    /**
     * @ngInject
     */
    function StateConfig($stateProvider) {
        $stateProvider.state('login', {
            url: '/login',
            templateUrl: 'scripts/views/login/login-partial.html',
            controller: 'AuthController'
        });
    }

    /**
     * @ngdoc overview
     * @name driver.views
     * @description
     * # driver
     */
    angular
      .module('driver.views.login', [
        'ui.router',
        'driver.auth'
      ]).config(StateConfig);

})();

(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/rt/:rtuuid/geo/:geouuid/poly/:polyuuid/dashboard',
            template: '<driver-dashboard></driver-dashboard>',
            label: 'Dashboard',
            showInNavbar: true
        });
    }

    angular.module('driver.views.dashboard', [
        'ui.router',
        'ui.bootstrap',
        'driver.toddow'
    ]).config(StateConfig);

})();

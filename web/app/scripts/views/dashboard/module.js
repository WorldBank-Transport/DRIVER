(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/:rtuuid/dashboard',
            template: '<driver-dashboard></driver-dashboard>',
            label: 'Dashboard'
        });
    }

    angular.module('driver.views.dashboard', [
        'ui.router',
        'ui.bootstrap'
    ]).config(StateConfig);

})();

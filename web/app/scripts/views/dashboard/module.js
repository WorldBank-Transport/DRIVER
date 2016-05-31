(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/',
            template: '<driver-dashboard></driver-dashboard>',
            label: 'NAV.DASHBOARD',
            showInNavbar: true
        });
    }

    angular.module('driver.views.dashboard', [
        'ui.router',
        'ui.bootstrap',
        'ase.resources',
        'driver.resources',
        'driver.toddow',
        'driver.stepwise',
        'driver.map-layers.recent-events',
        'driver.recentCounts',
        'driver.socialCosts',
        'driver.blackSpots',
        'driver.savedFilters',
        'driver.state'
    ]).config(StateConfig);

})();

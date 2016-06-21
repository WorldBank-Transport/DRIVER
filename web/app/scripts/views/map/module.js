(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('map', {
            url: '/map',
            template: '<driver-map></driver-map>',
            label: 'NAV.MAP',
            showInNavbar: true
        });
    }

    angular.module('driver.views.map', [
        'ase.auth',
        'ui.router',
        'ui.bootstrap',
        'Leaflet',
        'driver.tools.charts',
        'driver.tools.export',
        'driver.tools.interventions',
        'driver.tools.enforcers',
        'driver.customReports',
        'driver.enforcers',
        'driver.config',
        'driver.localization',
        'driver.map-layers',
        'driver.state'
    ]).config(StateConfig);

})();

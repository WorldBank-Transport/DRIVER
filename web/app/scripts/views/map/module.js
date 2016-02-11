(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('map', {
            url: '/map',
            template: '<driver-map></driver-map>',
            label: 'Map',
            showInNavbar: true
        });
    }

    angular.module('driver.views.map', [
        'ase.auth',
        'ui.router',
        'ui.bootstrap',
        'Leaflet',
        'driver.charts',
        'driver.export',
        'driver.config',
        'driver.localization',
        'driver.map-layers',
        'driver.state'
    ]).config(StateConfig);

})();

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
        'ui.router',
        'ui.bootstrap',
        'Leaflet',
        'driver.charts',
        'driver.config',
        'driver.map-layers',
        'driver.state'
    ]).config(StateConfig);

})();

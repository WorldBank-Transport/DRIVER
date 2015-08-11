(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('map', {
            url: '/rt/:rtuuid/geo/:geouuid/poly/:polyuuid/map',
            template: '<driver-map></driver-map>',
            label: 'Map',
            showInNavbar: true
        });
    }

    angular.module('driver.views.map', [
        'ui.router',
        'ui.bootstrap',
        'Leaflet'
    ]).config(StateConfig);

})();

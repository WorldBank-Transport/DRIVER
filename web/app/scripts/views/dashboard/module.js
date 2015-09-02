(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('dashboard', {
            url: '/dashboard',
            resolve: {
                /* ngInject */
                geographyResolution: function(GeographyState) { return GeographyState.resolution(); },
                /* ngInject */
                polygonResolution: function(PolygonState) { return PolygonState.resolution(); },
                /* ngInject */
                recordResolution: function(RecordState) { return RecordState.resolution(); }
            },
            template: '<driver-dashboard></driver-dashboard>',
            label: 'Dashboard',
            showInNavbar: true
        });
    }

    angular.module('driver.views.dashboard', [
        'ui.router',
        'ui.bootstrap',
        'ase.resources',
        'driver.resources',
        'driver.toddow'
    ]).config(StateConfig);

})();

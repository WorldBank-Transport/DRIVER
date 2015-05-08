(function () {
    'use strict';

    // TODO: Need to create view hierarchy rather than having this be a top-level view

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('boundary', {
            url: '/boundary',
            parent: 'sidebar',
            template: '<ase-boundary-list></ase-boundary-list>'
        });
        $stateProvider.state('boundaryUpload', {
            url: '/boundary/upload',
            parent: 'sidebar',
            template: '<ase-boundary-upload></ase-boundary-upload>'
        });
    }

    angular.module('ase.views.boundary', [
        'ui.router',
        'ase.config',
        'ase.views.sidebar',
        'ase.resources'
    ]).config(StateConfig);

})();

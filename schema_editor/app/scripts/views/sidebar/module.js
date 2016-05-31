(function () {
    'use strict';

    // TODO: Need to create view hierarchy rather than having this be a top-level view

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('sidebar', {
            abstract: true,
            url: '',
            template: '<ase-sidebar></ase-sidebar>'
        });
    }

    angular.module('ase.views.sidebar', [
        'ui.router',
        'ase.views.recordtype'
    ]).config(StateConfig);

})();

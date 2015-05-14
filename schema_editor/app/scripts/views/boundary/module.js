(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('bounds', {
            abstract: true,
            parent: 'sidebar',
            url: '/boundary',
            template: '<ui-view></ui-view>'
        });
        $stateProvider.state('bounds.list', {
            url: '',
            template: '<ase-boundary-list></ase-boundary-list>'
        });
        $stateProvider.state('bounds.add', {
            url: '/add',
            template: '<ase-boundary-add></ase-boundary-add>'
        });
        $stateProvider.state('bounds.edit', {
            url: '/edit/:uuid',
            template: '<ase-boundary-edit></ase-boundary-edit>'
        });
    }

    angular.module('ase.views.boundary', [
        'ui.router',
        'ase.config',
        'ngFileUpload',
        'ase.views.sidebar',
        'ase.resources'
    ]).config(StateConfig);

})();

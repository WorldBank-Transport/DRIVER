(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('geo', {
            abstract: true,
            parent: 'sidebar',
            url: '/geography',
            template: '<ui-view></ui-view>'
        });
        $stateProvider.state('geo.list', {
            url: '',
            template: '<ase-geo-list></ase-geo-list>'
        });
        $stateProvider.state('geo.add', {
            url: '/add',
            template: '<ase-geo-add></ase-geo-add>'
        });
        $stateProvider.state('geo.edit', {
            url: '/edit/:uuid',
            template: '<ase-geo-edit></ase-geo-edit>'
        });
    }

    angular.module('ase.views.geography', [
        'ui.router',
        'ase.config',
        'ase.directives',
        'ngFileUpload',
        'ase.notifications',
        'ase.views.sidebar',
        'ase.resources'
    ]).config(StateConfig);

})();

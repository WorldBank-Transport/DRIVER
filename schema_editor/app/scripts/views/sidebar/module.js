(function () {
    'use strict';

    // TODO: Need to create view hierarchy rather than having this be a top-level view

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('sidebar', {
            abstract: true,
            url: '',
            templateUrl: 'scripts/views/sidebar/sidebar-partial.html',
            controller: 'SidebarController',
            controllerAs: 'sb'
        });
    }

    angular.module('ase.views.sidebar', [
        'ui.router',
    ]).config(StateConfig);

})();
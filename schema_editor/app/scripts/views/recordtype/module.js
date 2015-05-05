(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('rt', {
            abstract: true,
            parent: 'sidebar',
            url: '/recordtype',
            template: '<ui-view></ui-view>'
        });
        $stateProvider.state('rt.list', {
            url: '',
            templateUrl: 'scripts/views/recordtype/list-partial.html',
            controller: 'RTListController',
            controllerAs: 'rtList'
        });
        $stateProvider.state('rt.add', {
            url: '/add',
            templateUrl: 'scripts/views/recordtype/add-partial.html',
            controller: 'RTAddController',
            controllerAs: 'rtAdd'
        });
        $stateProvider.state('rt.detail', {
            url: '/detail/:uuid',
            templateUrl: 'scripts/views/recordtype/detail-partial.html',
            controller: 'RTDetailController',
            controllerAs: 'rtDetail'
        });
    }

    angular.module('ase.views.recordtype', [
        'ui.router',
    ]).config(StateConfig);

})();
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
            templateUrl: 'scripts/views/recordtype/add-edit-partial.html',
            controller: 'RTAddController',
            controllerAs: 'rt'
        });
        $stateProvider.state('rt.edit', {
            url: '/edit/:uuid',
            templateUrl: 'scripts/views/recordtype/add-edit-partial.html',
            controller: 'RTEditController',
            controllerAs: 'rt'
        });
        $stateProvider.state('rt.detail', {
            url: '/detail/:uuid',
            templateUrl: 'scripts/views/recordtype/detail-partial.html',
            controller: 'RTDetailController',
            controllerAs: 'rtDetail'
        });
        $stateProvider.state('rt.schema-add', {
            url: '/detail/:uuid/schema/add',
            templateUrl: 'scripts/views/recordtype/schema/add-partial.html',
            controller: 'RTSchemaAddController',
            controllerAs: 'rtSchemaAdd'
        });
        $stateProvider.state('rt.schema-edit', {
            url: '/detail/:uuid/schema/:schema',
            templateUrl: 'scripts/views/recordtype/schema/edit-partial.html',
            controller: 'RTSchemaEditController',
            controllerAs: 'rtSchemaEdit'
        });
    }

    angular.module('ase.views.recordtype', [
        'ui.router',
        'ase.resources'
    ]).config(StateConfig);

})();

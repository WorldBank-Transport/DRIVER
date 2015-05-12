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
            template: '<ase-rt-list></ase-rt-list>'
        });
        $stateProvider.state('rt.add', {
            url: '/add',
            template: '<ase-rt-add></ase-rt-add>'
        });
        $stateProvider.state('rt.edit', {
            url: '/edit/:uuid',
            template: '<ase-rt-edit></ase-rt-edit>'
        });
        $stateProvider.state('rt.detail', {
            url: '/detail/:uuid',
            template: '<ase-rt-detail></ase-rt-detail>'
        });
        $stateProvider.state('rt.detail-edit', {
            url: '/detail/:uuid/edit',
            template: '<ase-rt-detail-edit></ase-rt-detail-edit>'
        });
        $stateProvider.state('rt.detail-add', {
            url: '/detail/:uuid/add',
            template: '<ase-rt-detail-add></ase-rt-detail-add>'
        });
        $stateProvider.state('rt.schema-add', {
            url: '/detail/:uuid/schema/add',
            template: '<ase-rt-schema-add></ase-rt-schema-add>'
        });
        $stateProvider.state('rt.schema-edit', {
            url: '/detail/:uuid/schema/:schema',
            template: '<ase-rt-schema-edit></ase-rt-schema-edit>'
        });
    }

    angular.module('ase.views.recordtype', [
        'ui.router',
        'ase.config',
        'ase.resources'
    ]).config(StateConfig);

})();

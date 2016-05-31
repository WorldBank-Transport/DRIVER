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
        $stateProvider.state('rt.preview', {
            url: '/preview/:uuid',
            template: '<ase-rt-preview></ase-rt-preview>'
        });
        $stateProvider.state('rt.related', {
            url: '/related/:uuid',
            template: '<ase-rt-related></ase-rt-related>'
        });
        $stateProvider.state('rt.related-edit', {
            url: '/related/:uuid/edit/:schema',
            template: '<ase-rt-related-edit></ase-rt-related-edit>'
        });
        $stateProvider.state('rt.related-add', {
            url: '/related/:uuid/add',
            template: '<ase-rt-related-add></ase-rt-related-add>'
        });
        $stateProvider.state('rt.schema-edit', {
            url: '/related/:uuid/schema/:schema',
            template: '<ase-rt-schema-edit></ase-rt-schema-edit>'
        });
    }

    angular.module('ase.views.recordtype', [
        'ui.router',
        'ui.bootstrap',
        'json-editor',
        'ase.config',
        'ase.directives',
        'ase.notifications',
        'ase.schemas',
        'ase.resources'
    ]).config(StateConfig);

})();

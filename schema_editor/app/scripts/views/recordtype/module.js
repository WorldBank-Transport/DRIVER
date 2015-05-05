(function () {
    'use strict';

    // TODO: Need to create view hierarchy rather than having this be a top-level view

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('recordtypelist', {
            url: '/',
            templateUrl: 'scripts/views/recordtype/list/list-partial.html',
            controller: 'ListController',
            controllerAs: 'list'
        });
    }

    angular.module('ase.views.recordtype', [
        'ui.router',
    ]).config(StateConfig);

})();

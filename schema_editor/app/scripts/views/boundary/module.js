(function () {
    'use strict';

    // TODO: Need to create view hierarchy rather than having this be a top-level view

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('boundary', {
            url: '/boundary',
            parent: 'sidebar',
            templateUrl: 'scripts/views/boundary/list-partial.html',
            controller: 'BoundaryListController',
            controllerAs: 'boundaryList'
        });
        $stateProvider.state('boundaryUpload', {
            url: '/boundary/upload',
            parent: 'sidebar',
            templateUrl: 'scripts/views/boundary/upload-partial.html',
            controller: 'BoundaryUploadController',
            controllerAs: 'boundaryUpload'
        });
    }

    angular.module('ase.views.boundary', [
        'ui.router',
        'ase.views.sidebar'
    ]).config(StateConfig);

})();
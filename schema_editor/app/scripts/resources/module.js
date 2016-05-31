(function () {
    'use strict';

    /* ngInject */
    function ResourceConfig($resourceProvider) {
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }

    angular.module('ase.resources', [
        'ngResource',
        'ase.config',
        'ngFileUpload'
    ]).config(ResourceConfig);

})();

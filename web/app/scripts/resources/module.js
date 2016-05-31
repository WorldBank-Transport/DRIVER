(function () {
    'use strict';

    /* ngInject */
    function ResourceConfig($resourceProvider) {
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }

    angular.module('driver.resources', [
        'ngResource',
        'driver.config',
        'driver.state'
    ]).config(ResourceConfig);

})();

(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig($stateProvider) {
    }

    angular.module('driver.toddow', [
        'ui.router',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

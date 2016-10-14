(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.socialCosts', [
        'driver.resources',
        'driver.state',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

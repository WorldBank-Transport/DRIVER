(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.stepwise', [
        'driver.state',
        'ui.router',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

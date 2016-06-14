(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.stepwise', [
        'driver.state',
        'driver.localization',
        'ui.router',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

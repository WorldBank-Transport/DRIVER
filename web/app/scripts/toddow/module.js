(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.toddow', [
        'driver.state',
        'ui.router',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

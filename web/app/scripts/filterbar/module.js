(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.filterbar', [
        'debounce',
        'driver.resources',
        'driver.state',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

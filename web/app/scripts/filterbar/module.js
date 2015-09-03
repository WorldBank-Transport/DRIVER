(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.filterbar', [
        'driver.resources',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

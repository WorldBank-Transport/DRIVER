(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.recentCounts', [
        'driver.resources',
        'driver.state',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

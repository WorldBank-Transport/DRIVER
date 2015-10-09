(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.recentCounts', [
        'driver.resources',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

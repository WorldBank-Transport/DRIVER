(function () {
    'use strict';

    /* ngInject */
    function DirectiveConfig() {
    }

    angular.module('driver.stepwise', [
        'ui.router',
        'ui.bootstrap'
    ]).config(DirectiveConfig);

})();

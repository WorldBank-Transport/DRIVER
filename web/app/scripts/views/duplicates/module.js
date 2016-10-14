(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('duplicates', {
            url: '/duplicates',
            template: '<driver-duplicates-list></driver-duplicates-list>',
            label: 'NAV.DUPLICATES',
            showInNavbar: false
        });
    }

    angular.module('driver.views.duplicates', [
        'ngSanitize',
        'ase.auth',
        'driver.config',
        'driver.localization',
        'driver.resources',
        'driver.state',
        'ui.bootstrap',
        'ui.router',
    ]).config(StateConfig);

})();

(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('home', {
            url: '/',
            template: '<driver-home></driver-home>',
            label: 'Home',
            showInNavbar: true
        });
    }

    angular.module('driver.views.home', [
        'ui.router',
        'ui.bootstrap'
    ]).config(StateConfig);

})();

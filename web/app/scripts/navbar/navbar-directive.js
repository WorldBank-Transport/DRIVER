(function () {
    'use strict';

    /* ngInject */
    function Navbar() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/navbar/navbar-partial.html',
            controller: 'NavbarController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.navbar')
    .directive('driverNavbar', Navbar);

})();

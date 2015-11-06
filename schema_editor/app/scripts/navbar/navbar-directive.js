(function () {
    'use strict';

    /* ngInject */
    function ASENavbar() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/navbar/navbar-partial.html',
            controller: 'ASENavbarController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.navbar')
    .directive('aseNavbar', ASENavbar);

})();

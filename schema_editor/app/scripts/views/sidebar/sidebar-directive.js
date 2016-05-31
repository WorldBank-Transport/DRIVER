(function () {
    'use strict';

    /* ngInject */
    function Sidebar() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/sidebar/sidebar-partial.html',
            controller: 'SidebarController',
            controllerAs: 'sb',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.sidebar')
    .directive('aseSidebar', Sidebar);

})();

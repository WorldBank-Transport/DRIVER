(function () {
    'use strict';

    /* ngInject */
    function SidebarController() {
        var ctl = this;
        initialize();

        function initialize() {
            // TODO: Delete once ctl is used
            ctl.field = 'foo';
        }
    }

    angular.module('ase.views.sidebar')
    .controller('SidebarController', SidebarController);
})();
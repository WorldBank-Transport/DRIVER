(function () {
    'use strict';

    /* ngInject */
    function BoundaryListController() {
        var ctl = this;
        initialize();

        function initialize() {
            // TODO: Delete once ctl is used
            ctl.field = 'foo';
        }
    }

    angular.module('ase.views.boundary')
    .controller('BoundaryListController', BoundaryListController);
})();
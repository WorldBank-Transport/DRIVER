(function () {
    'use strict';

    /* ngInject */
    function BoundaryListController(Boundaries) {
        var ctl = this;
        initialize();

        function initialize() {
          ctl.boundaries = Boundaries.query();
        }
    }

    angular.module('ase.views.boundary')
    .controller('BoundaryListController', BoundaryListController);
})();

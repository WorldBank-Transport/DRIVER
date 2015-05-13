(function () {
    'use strict';

    /* ngInject */
    function BoundaryUploadController() {
        var ctl = this;
        initialize();

        function initialize() {
            // TODO: Delete once ctl is used
            ctl.field = 'foo';
        }
    }

    angular.module('ase.views.boundary')
    .controller('BoundaryUploadController', BoundaryUploadController);
})();
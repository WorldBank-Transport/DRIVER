(function () {
    'use strict';

    /* ngInject */
    function RTSchemaEditController() {
        var ctl = this;
        initialize();

        function initialize() {
            // TODO: Delete once ctl is used
            ctl.field = 'foo';
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTSchemaEditController', RTSchemaEditController);
})();
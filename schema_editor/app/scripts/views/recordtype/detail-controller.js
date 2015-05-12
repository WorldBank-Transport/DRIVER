(function () {
    'use strict';

    /* ngInject */
    function RTDetailController($stateParams, RecordTypes) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.recordType = RecordTypes.get({ id: $stateParams.uuid });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTDetailController', RTDetailController);
})();
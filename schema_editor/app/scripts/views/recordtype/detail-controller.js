(function () {
    'use strict';

    /* ngInject */
    function RTDetailController($stateParams, RecordSchemas, RecordTypes) {
        var ctl = this;
        initialize();

        function initialize() {
            RecordTypes.get({ id: $stateParams.uuid }).$promise.then(function (data) {
                ctl.recordType = data;
                ctl.currentSchema = RecordSchemas.get({ id: ctl.recordType.current_schema });
            });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTDetailController', RTDetailController);
})();
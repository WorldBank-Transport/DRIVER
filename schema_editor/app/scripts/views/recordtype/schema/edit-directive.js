(function () {
    'use strict';

    /* ngInject */
    function RTSchemaEdit() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/schema/edit-partial.html',
            controller: 'RTSchemaEditController',
            controllerAs: 'rtSchemaEdit',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .directive('aseRtSchemaEdit', RTSchemaEdit);

})();

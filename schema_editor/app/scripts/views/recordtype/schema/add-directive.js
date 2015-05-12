(function () {
    'use strict';

    /* ngInject */
    function RTSchemaAdd() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/schema/add-partial.html',
            controller: 'RTSchemaAddController',
            controllerAs: 'rtSchemaAdd',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .directive('aseRtSchemaAdd', RTSchemaAdd);

})();

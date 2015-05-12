(function () {
    'use strict';

    /* ngInject */
    function RTAdd() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/add-edit-partial.html',
            controller: 'RTAddController',
            controllerAs: 'rt',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .directive('aseRtAdd', RTAdd);

})();

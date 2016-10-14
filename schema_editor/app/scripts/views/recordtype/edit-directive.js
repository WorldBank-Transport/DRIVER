(function () {
    'use strict';

    /* ngInject */
    function RTEdit() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/add-edit-partial.html',
            controller: 'RTEditController',
            controllerAs: 'rt',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .directive('aseRtEdit', RTEdit);

})();

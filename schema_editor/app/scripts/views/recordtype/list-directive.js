(function () {
    'use strict';

    /* ngInject */
    function RTList() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/list-partial.html',
            controller: 'RTListController',
            controllerAs: 'rtList',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .directive('aseRtList', RTList);

})();

(function () {
    'use strict';

    /* ngInject */
    function RTDetail() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/detail-partial.html',
            controller: 'RTDetailController',
            controllerAs: 'rt',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .directive('aseRtDetail', RTDetail);

})();

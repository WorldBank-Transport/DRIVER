(function () {
    'use strict';

    /* ngInject */
    function RTRelated() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/related-partial.html',
            controller: 'RTRelatedController',
            controllerAs: 'rt',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .directive('aseRtRelated', RTRelated);

})();

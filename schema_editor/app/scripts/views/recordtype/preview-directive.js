(function () {
    'use strict';

    /* ngInject */
    function RTPreview() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/recordtype/preview-partial.html',
            controller: 'RTPreviewController',
            controllerAs: 'rtPreview',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.recordtype')
    .directive('aseRtPreview', RTPreview);

})();

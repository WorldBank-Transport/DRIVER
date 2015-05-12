(function () {
    'use strict';

    /* ngInject */
    function BoundaryUpload() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/boundary/upload-partial.html',
            controller: 'BoundaryUploadController',
            controllerAs: 'boundaryUpload',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.boundary')
    .directive('aseBoundaryUpload', BoundaryUpload);

})();

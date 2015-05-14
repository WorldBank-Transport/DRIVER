(function () {
    'use strict';

    /* ngInject */
    function BoundaryEdit() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/boundary/edit-partial.html',
            controller: 'BoundaryEditController',
            controllerAs: 'boundsEdit',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.boundary')
    .directive('aseBoundaryEdit', BoundaryEdit);

})();

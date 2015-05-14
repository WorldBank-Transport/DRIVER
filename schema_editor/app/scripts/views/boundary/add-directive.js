(function () {
    'use strict';

    /* ngInject */
    function BoundaryAdd() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/boundary/add-partial.html',
            controller: 'BoundaryAddController',
            controllerAs: 'boundsAdd',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.boundary')
    .directive('aseBoundaryAdd', BoundaryAdd);

})();

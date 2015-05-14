(function () {
    'use strict';

    /* ngInject */
    function BoundaryList() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/boundary/list-partial.html',
            controller: 'BoundaryListController',
            controllerAs: 'boundsList',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.boundary')
    .directive('aseBoundaryList', BoundaryList);

})();

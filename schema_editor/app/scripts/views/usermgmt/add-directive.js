(function () {
    'use strict';

    /* ngInject */
    function UserAdd() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/usermgmt/add-partial.html',
            controller: 'UserAddController',
            controllerAs: 'UserAdd',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.usermgmt')
    .directive('aseUserAdd', UserAdd);

})();

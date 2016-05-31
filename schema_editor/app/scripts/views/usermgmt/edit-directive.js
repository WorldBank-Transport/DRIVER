(function () {
    'use strict';

    /* ngInject */
    function UserEdit() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/usermgmt/edit-partial.html',
            controller: 'UserEditController',
            controllerAs: 'UserEdit',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.usermgmt')
    .directive('aseUserEdit', UserEdit);

})();

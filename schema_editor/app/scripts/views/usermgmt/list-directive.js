(function () {
    'use strict';

    /* ngInject */
    function UserList() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/usermgmt/list-partial.html',
            controller: 'UserListController',
            controllerAs: 'UserList',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.usermgmt')
    .directive('aseUserList', UserList);

})();

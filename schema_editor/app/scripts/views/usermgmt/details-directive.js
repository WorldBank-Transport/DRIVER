(function () {
    'use strict';

    /* ngInject */
    function UserDetails() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/usermgmt/details-partial.html',
            controller: 'UserDetailsController',
            controllerAs: 'UserDetails',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.usermgmt')
    .directive('aseUserDetails', UserDetails);

})();

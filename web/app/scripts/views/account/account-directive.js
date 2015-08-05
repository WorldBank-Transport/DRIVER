(function () {
    'use strict';

    /* ngInject */
    function Account() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/account/account-partial.html',
            controller: 'AccountController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.views.account')
    .directive('driverAccount', Account);

})();

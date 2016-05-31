(function () {
    'use strict';

    /* ngInject */
    function AccountController($scope, AuthService, UserInfo) {

        $scope.userInfo = UserInfo;

        if ($scope.userInfo) {
            $scope.userInfo.token = AuthService.getToken();
        }
    }

    angular.module('driver.views.account')
    .controller('AccountController', AccountController);

})();

(function() {
    'use strict';

    /**
     * @ngInject
     */
    function AuthController ($scope, $state, AuthService) {

        $scope.auth = {};

        $scope.alerts = [];
        $scope.addAlert = function(alertObject) {
            $scope.alerts.push(alertObject);
        };
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.authenticate = function() {
            $scope.alerts = [];
            $scope.authenticated = AuthService.authenticate($scope.auth);
            $scope.authenticated.then(function(result) {
                if (result.isAuthenticated) {
                    $state.go('dashboard');
                } else {
                    handleError(result);
                }
            }, function (result) {
                handleError(result);
            });
        };

        var handleError = function (result) {
            $scope.auth.failure = true;
            var msg = result.error || (result.status + ': Unknown Error.');
            $scope.addAlert({
                type: 'danger',
                msg: msg
            });
        };
    }

    angular.module('driver.views.login').controller('AuthController', AuthController);

})();

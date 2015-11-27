(function() {
    'use strict';

    /**
     * @ngInject
     */
    function AuthController ($scope, $state, $window, AuthService, SSOClients, WebConfig) {

        $scope.auth = {};
        $scope.ssoClients = SSOClients;

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
                    // redirect to dashboard, with a full page reload,
                    // to pick up the newly set credentials
                    $window.location.href = '/';
                } else {
                    handleError(result);
                }
            }, function (result) {
                handleError(result);
            });
        };

        $scope.sso = function(client) {
            $window.location.href = WebConfig.api.hostname + '/openid/openid/' + client;
        };

        var handleError = function(result) {
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

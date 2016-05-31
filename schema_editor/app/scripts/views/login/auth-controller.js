(function() {
    'use strict';

    /**
     * @ngInject
     */
    function AuthController ($scope, $state, $window, AuthService, SSOClients, ASEConfig) {

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
            $scope.authenticated = AuthService.authenticate($scope.auth, true);
            $scope.authenticated.then(function(result) {
                if (result.isAuthenticated) {
                    // redirect to editor main page, with a full page reload,
                    // to pick up the newly set credentials
                    $window.location.href = '/editor/';
                } else {
                    handleError(result);
                }
            }, function (result) {
                handleError(result);
            });
        };

        $scope.sso = function(client) {
            $window.location.href = [ASEConfig.api.hostname,
                '/openid/openid/',
                client,
                '?next=/editor/'].join('');
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

    angular.module('ase.views.login').controller('AuthController', AuthController);

})();

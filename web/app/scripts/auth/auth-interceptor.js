(function() {
    'use strict';

    /**
     * @ngInject
     */
    function AuthInterceptor ($q, $cookies) {

        var module = {};
        module.request = function(config) {
            // TODO: make relative URL
            if (config.url.indexOf('/api') === 0) {
                // TODO: make relative to host in config
                if (config.url.indexOf('/api-token-auth') !== 0) {
                    config.headers.Authorization = 'Token ' + $cookies.getObject('AuthService.token');
                }
            }
            return config || $q.when(config);
        };

        return module;
    }

    angular.module('driver.auth').factory('AuthInterceptor', AuthInterceptor);

})();

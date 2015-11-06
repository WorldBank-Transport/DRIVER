(function() {
    'use strict';

    /**
     * @ngInject
     */
    function AuthInterceptor ($q, $cookies) {

        var module = {};
        module.request = function(config) {
            // set auth header for api requests
            if (config.url.indexOf('api/') > -1) {
                config.headers.Authorization = 'Token ' + $cookies.getObject('AuthService.token');
            }
            return config || $q.when(config);
        };

        return module;
    }

    angular.module('driver.auth').factory('AuthInterceptor', AuthInterceptor);

})();

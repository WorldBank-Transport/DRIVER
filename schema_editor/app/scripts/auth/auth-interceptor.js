(function() {
    'use strict';

    /**
     * @ngInject
     */
    function AuthInterceptor ($q, $cookies) {

        var module = {};
        module.request = function(config) {
            // set auth header for api requests if not already set
            if (config.url.indexOf('api/') > -1 && !config.headers.Authorization) {
                config.headers.Authorization = 'Token ' + $cookies.getObject('AuthService.token');
            }
            return config || $q.when(config);
        };

        return module;
    }

    angular.module('ase.auth').factory('AuthInterceptor', AuthInterceptor);

})();

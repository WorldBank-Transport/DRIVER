(function () {
'use strict';

    /* ngInject */
    function InterceptorConfig($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.interceptors.push('LogoutInterceptor');
    }

    angular.module('driver.auth', [
        'driver.userdata',
        'ngCookies'
      ]).config(InterceptorConfig);
})();

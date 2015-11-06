(function() {
    'use strict';

    /**
     * @ngInject
     */

    function LogoutInterceptor ($q, $rootScope) {

        var module = {};

        var events = {
            logOutUser: 'DRIVER:Auth:LogOutUser'
        };

        module.events = events;
        module.responseError =  function(response) {
            if (response.status === 401) {
                $rootScope.$broadcast(events.logOutUser);
            }
            return $q.reject(response);
        };

        return module;
    }

    angular.module('driver.auth').factory('LogoutInterceptor', LogoutInterceptor);

})();

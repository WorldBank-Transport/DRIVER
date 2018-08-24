(function() {
    'use strict';

    /**
     * @ngInject
     */

    function LogoutInterceptor ($q, $rootScope) {

        var module = {};

        var events = {
            logOutUser: 'ASE:Auth:LogOutUser'
        };

        module.events = events;
        module.responseError =  function(response) {
            if (response.status === 401 && isSameHost(response.config.url)) {
                $rootScope.$broadcast(events.logOutUser);
            }
            return $q.reject(response);
        };

        return module;
    }

    /**
     * Check if the URL has the same host as the current page.
     */
    function isSameHost(url) {
        // Cross-browser way to get the hostname from a URL
        var urlParser = document.createElement('a');
        urlParser.href = url;
        return urlParser.hostname === window.location.hostname;
    }

    angular.module('ase.auth').factory('LogoutInterceptor', LogoutInterceptor);

})();

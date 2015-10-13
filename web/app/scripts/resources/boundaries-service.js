(function () {
    'use strict';

    /* ngInject */
    function Boundaries($resource, WebConfig) {
        return $resource(WebConfig.api.hostname + '/api/boundaries/:id/',
                         {id: '@uuid', limit: 'all'}, {
            create: {
                method: 'POST'
            },
            get: {
                method: 'GET'
            },
            query: {
                method: 'GET',
                transformResponse: function(data) { return angular.fromJson(data).results; },
                isArray: true
            },
            update: {
                method: 'PATCH'
            }
        });
    }

    angular.module('driver.resources')
    .factory('Boundaries', Boundaries);

})();

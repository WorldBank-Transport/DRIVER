(function () {
    'use strict';

    /* ngInject */
    function Duplicates($resource, WebConfig) {
        return $resource(WebConfig.api.hostname + '/api/duplicates/:id/',
                         {id: '@uuid', limit: 'all'}, {
            get: {
                method: 'GET'
            },
            query: {
                method: 'GET',
                transformResponse: function(data) { return angular.fromJson(data); },
                isArray: false
            },
            update: {
                method: 'PATCH'
            }
        });
    }

    angular.module('driver.resources')
    .factory('Duplicates', Duplicates);

})();

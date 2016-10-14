(function () {
    'use strict';

    /* ngInject */
    function Duplicates($resource, WebConfig) {
        var baseUrl = WebConfig.api.hostname + '/api/duplicates/:id/';
        return $resource(baseUrl,
                         {id: '@uuid', limit: 'all', resolved: 'False'}, {
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
            },
            resolve: {
                method: 'PATCH',
                url: baseUrl + 'resolve/'
            }
        });
    }

    angular.module('driver.resources')
    .factory('Duplicates', Duplicates);

})();

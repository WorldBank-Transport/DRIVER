(function () {
    'use strict';

    /* ngInject */
    function Polygons($resource, WebConfig) {
        return $resource(WebConfig.api.hostname + '/api/boundarypolygons/:id/', {id: '@uuid'}, {
            create: {
                method: 'POST'
            },
            get: {
                method: 'GET'
            },
            query: {
                method: 'GET',
                transformResponse: function(data) {
                    return angular.fromJson(data).results.features;
                },
                isArray: true
            },
            update: {
                method: 'PATCH'
            }
        });
    }

    angular.module('driver.resources')
    .factory('Polygons', Polygons);

})();

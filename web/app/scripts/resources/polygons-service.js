(function () {
    'use strict';

    /* ngInject */
    function Polygons($resource, WebConfig) {
        return $resource(WebConfig.api.hostname + '/api/boundarypolygons/:id/',
                         {id: '@uuid', limit: 'all'}, {
            create: {
                method: 'POST'
            },
            get: {
                method: 'GET',
                params: { nogeom: true }
            },
            query: {
                method: 'GET',
                transformResponse: function(data) {
                    return angular.fromJson(data).results;
                },
                isArray: true,
                params: { nogeom: true }
            },
            update: {
                method: 'PATCH'
            }
        });
    }

    angular.module('driver.resources')
    .factory('Polygons', Polygons);

})();

(function () {
    'use strict';

    /* ngInject */
    function Boundaries($resource, Config) {
        var urlString = Config.api.hostname + '/api/boundaries/:id';

        var resource = {
          'query': stdResource.query,
          'get': stdResource.get,
          'post': postWithFile,
          'remove': stdResource.remove,
          'delete': stdResource.delete
        };

        var stdResource = $resource(urlString, {id: '@uuid'}, {
            query: {
                method: 'GET',
                transformResponse: function(data) { return angular.fromJson(data).results; },
                isArray: true
            }
        });

        return resource;
    }

    angular.module('ase.resources')
      .factory('Boundaries', Boundaries);
})();

(function () {
    'use strict';

    /* ngInject */
    function BlackSpotConfig($resource, ASEConfig) {
        var url = ASEConfig.api.hostname + '/api/blackspotconfig/:id/';
        return $resource(url, {id: '@uuid', limit: 'all'}, {
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

    angular.module('ase.resources')
    .factory('BlackSpotConfig', BlackSpotConfig);

})();

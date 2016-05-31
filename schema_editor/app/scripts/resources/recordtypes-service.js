(function () {
    'use strict';

    /* ngInject */
    function RecordTypes($resource, ASEConfig) {
        var url = ASEConfig.api.hostname + '/api/recordtypes/:id/';
        return $resource(url, {id: '@uuid', limit: 'all'}, {
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

    angular.module('ase.resources')
    .factory('RecordTypes', RecordTypes);

})();

(function() {
    'use strict';

    function RecordCosts($resource, ASEConfig) {
        var url = ASEConfig.api.hostname + '/api/recordcosts/:id/';
        return $resource(url, {id:'@uuid'}, {
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
            }
        });
    }

    angular.module('ase.resources')
        .factory('RecordCosts', RecordCosts);
})();

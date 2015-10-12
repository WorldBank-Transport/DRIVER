(function () {
    'use strict';

    /* ngInject */
    function RecordTypes($resource, ASEConfig) {
        var url = ASEConfig.api.hostname + '/api/recordtypes/:id/';
        return $resource(url, {id: '@uuid'}, {
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
            // Recent counts for a record type: monthly, quarterly, yearly totals included
            recentCounts: {
                method: 'GET',
                url: url + 'recent_counts/'
            },
            update: {
                method: 'PATCH'
            }
        });
    }

    angular.module('ase.resources')
    .factory('RecordTypes', RecordTypes);

})();

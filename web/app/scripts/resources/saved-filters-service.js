(function () {
    'use strict';

    /* ngInject */
    function SavedFilters($resource, WebConfig) {
        return $resource(WebConfig.api.hostname + '/api/userfilters/:id/', {id: '@uuid'}, {
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
    .factory('SavedFilters', SavedFilters);

})();

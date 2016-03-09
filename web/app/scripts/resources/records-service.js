(function () {
    'use strict';

    /* ngInject */
    function Records($resource, WebConfig) {
        return $resource(WebConfig.api.hostname + '/api/records/:id/', {
            id: '@uuid',
            archived: 'False' // Note: a regular 'false' boolean doesn't filter properly in DRF
        }, {
            create: {
                method: 'POST'
            },
            get: {
                method: 'GET'
            },
            toddow: {
                url: WebConfig.api.hostname + '/api/records/toddow/',
                method: 'GET',
                isArray: true
            },
            stepwise: {
                url: WebConfig.api.hostname + '/api/records/stepwise/',
                method: 'GET',
                isArray: true
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
    .factory('Records', Records);

})();

(function () {
    'use strict';

    /* ngInject */
    function Blackspots($resource, WebConfig) {
        return $resource(
            WebConfig.api.hostname + '/api/blackspots/:id/',
            {
                id: '@uuid', limit: 'all'
            },
            {
                create: {
                    method: 'POST'
                },
                get: {
                    method: 'GET'
                },
                query: {
                    method: 'GET',
                    transformResponse: function(data) {
                        if (data){
                            return angular.fromJson(data).results;
                        }
                        return [];
                    },
                    isArray: true
                },
                update: {
                    method: 'PATCH'
                }
            });
    }

    /* ngInject */
    function BlackspotSets($resource, WebConfig) {
        return $resource(
            WebConfig.api.hostname + '/api/blackspotsets/:id/',
            {
                id: '@uuid', limit: 'all'
            },
            {
                create: {
                    method: 'POST'
                },
                get: {
                    method: 'GET'
                },
                query: {
                    method: 'GET',
                    transformResponse: function(data) {
                        if (data) {
                            return angular.fromJson(data).results;
                        }
                        return [];
                    },
                    isArray: true
                },
                update: {
                    method: 'PATCH'
                }
            });
    }

    angular.module('driver.resources')
        .factory('Blackspots', Blackspots)
        .factory('BlackspotSets', BlackspotSets);

})();

(function () {
    'use strict';

    /* ngInject */
    function Assignments($resource, WebConfig) {
        return $resource(
            WebConfig.api.hostname + '/api/assignments/:id/',
            {
                id: '@uuid', limit: 'all'
            },
            {
                query: {
                    method: 'GET',
                    transformResponse: function(data) {
                        if (data){
                            return angular.fromJson(data);
                        }
                        return [];
                    },
                    isArray: true
                },
            });
    }

    angular.module('driver.resources')
        .factory('Assignments', Assignments);
})();


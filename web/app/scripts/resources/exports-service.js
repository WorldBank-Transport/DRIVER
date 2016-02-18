(function () {
    'use strict';

    /* ngInject */
    function Exports($resource, WebConfig) {
        return $resource(WebConfig.api.hostname + '/api/csv-export/:id/', {id: '@uuid'}, {
            create: {
                method: 'POST'
            },
            get: {
                method: 'GET'
            },
        });
    }

    angular.module('driver.resources')
    .factory('Exports', Exports);

})();

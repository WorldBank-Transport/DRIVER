(function () {
    'use strict';

    /* ngInject */
    function AuditLogs($resource, WebConfig) {
        return $resource(WebConfig.api.hostname + '/api/audit-log/', { format: 'csv' }, {
            csv: {
                method: 'GET',
                isArray: false,
                transformResponse: function (data) { return { data: data }; }
            },
        });
    }

    angular.module('driver.resources')
    .factory('AuditLogs', AuditLogs);

})();

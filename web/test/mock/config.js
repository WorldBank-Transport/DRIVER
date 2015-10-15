(function () {
    'use strict';

    var config = {
        debug: true,
        html5Mode: {
            enabled: false,
            prefix: '!'
        },
        api: {
            hostname: 'http://localhost:7000'
        },
        windshaft: {
            hostname: 'http://localhost:7000'
        },
        nominatim: {
            key: 'abc123'
        },
        record: {
            limit: 50
        }
    };

    angular.module('driver.config', [])
    .constant('WebConfig', config);
})();

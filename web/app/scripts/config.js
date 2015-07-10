
(function () {
    'use strict';

    // WARNING: This file is templated by ansible, any changes will be overridden on next provision
    // Modify this file in: `deployment/ansible/roles/driver.web/templates/web-config-js.conf.j2`
    //
    // Note: This module is also mocked for Travis. If any changes are made to it, they should also
    // be made in: `web/test/mock/config.js`

    var config = {
        debug: true,
        html5Mode: {
            enabled: false,
            prefix: '!'
        },
        api: {
            hostname: 'http://localhost:7000'
        }
    };

    angular.module('driver.config', [])
    .constant('Config', config);
})();

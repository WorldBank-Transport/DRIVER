(function () {
    'use strict';

    var config = {
        debug: true,
        html5Mode: {
            enabled: false,
            prefix: '!'
        },
        api: {
            hostname: 'http://localhost:7000',
            groups: {
                admin: 'admin',
                readOnly: 'public',
                readWrite: 'analyst'
            }
        }
    };

    angular.module('ase.config', [])
    .constant('ASEConfig', config);
})();

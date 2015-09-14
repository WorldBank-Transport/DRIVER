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
        }
    };

    angular.module('ase.config', [])
    .constant('ASEConfig', config);
})();

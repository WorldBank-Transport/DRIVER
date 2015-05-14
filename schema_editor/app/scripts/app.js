(function () {
    'use strict';

    /* ngInject */
    function DefaultRoutingConfig($locationProvider, $urlRouterProvider, Config) {
        $locationProvider.html5Mode(Config.html5Mode.enabled);
        $locationProvider.hashPrefix(Config.html5Mode.prefix);

        $urlRouterProvider.otherwise('/recordtype');
    }

    /* ngInject */
    function LogConfig($logProvider, Config) {
        $logProvider.debugEnabled(Config.debug);
    }

    /**
     * @ngdoc overview
     * @name ase
     * @description
     * # ase: Ashlar Schema Editor
     *
     * Main module of the application.
     */
    angular.module('ase', [
        'ase.config',
        'ase.views.geography',
        'ase.views.recordtype',
        'ase.resources'
    ])
    .config(DefaultRoutingConfig)
    .config(LogConfig);
})();

(function () {
    'use strict';

    /* ngInject */
    function DefaultRoutingConfig($locationProvider, $urlRouterProvider, ASEConfig) {
        $locationProvider.html5Mode(ASEConfig.html5Mode.enabled);
        $locationProvider.hashPrefix(ASEConfig.html5Mode.prefix);

        $urlRouterProvider.otherwise('/recordtype');
    }

    /* ngInject */
    function LogConfig($logProvider, ASEConfig) {
        $logProvider.debugEnabled(ASEConfig.debug);
    }

    /* ngInject */
    function LocalStorageConfig(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('DRIVER.ASE')
                                   .setStorageType('sessionStorage');
    }

    /* ngInject */
    function HttpConfig($httpProvider) {
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
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
        'ase.notifications',
        'ase.views.geography',
        'ase.views.recordtype',
        'ase.resources',
        'ui.router',
        'LocalStorageModule'
    ])
    .config(DefaultRoutingConfig)
    .config(HttpConfig)
    .config(LocalStorageConfig)
    .config(LogConfig);
})();

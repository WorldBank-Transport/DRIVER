(function () {
    'use strict';

    /* ngInject */
    function DefaultRoutingConfig($locationProvider, $urlRouterProvider, Config) {
        $locationProvider.html5Mode(Config.html5Mode.enabled);
        $locationProvider.hashPrefix(Config.html5Mode.prefix);

        $urlRouterProvider.otherwise('/');
    }

    /* ngInject */
    function LogConfig($logProvider, Config) {
        $logProvider.debugEnabled(Config.debug);
    }

    /**
     * @ngdoc overview
     * @name driver
     * @description
     * # driver: Data for Road Incident Visualization, Evaluation, and Reporting
     *
     * Main module of the application.
     */
    angular.module('driver', [
        'driver.config',
        'driver.navbar',
        'driver.views.account',
        'driver.views.dashboard',
        'driver.views.home',
        'driver.views.map',
        'driver.views.record',
        'ui.router'
    ])
    .config(DefaultRoutingConfig)
    .config(LogConfig);
})();

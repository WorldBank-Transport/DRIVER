(function () {
    'use strict';

    /* ngInject */
    function DefaultRoutingConfig($locationProvider, $urlRouterProvider, ASEConfig) {
        $locationProvider.html5Mode(ASEConfig.html5Mode.enabled);
        $locationProvider.hashPrefix(ASEConfig.html5Mode.prefix);

        // workaround for infinite redirect when not logged in
        // https://github.com/angular-ui/ui-router/issues/600
        $urlRouterProvider.otherwise(function($injector) {
            var $state = $injector.get('$state');
            // '/recordtype'
            $state.go('rt.list');
        });
    }

    /* ngInject */
    function LogConfig($logProvider, ASEConfig) {
        $logProvider.debugEnabled(ASEConfig.debug);
    }

    /* ngInject */
    function LocalStorageConfig(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('DRIVER.ASE');
    }

    /* ngInject */
    function RunConfig($cookies, $http, $rootScope, $state, AuthService, LogoutInterceptor) {
        // Django CSRF Token compatibility
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
        $http.defaults.xsrfCookieName = 'csrftoken';

        $rootScope.$on('$stateChangeStart', function (event, to, toParams, from, fromParams) {

            if (!AuthService.isAuthenticated()) {
                event.preventDefault();
                // broadcast success to avoid infinite redirect
                // see issue: https://github.com/angular-ui/ui-router/issues/178
                $state.go('login', null, {notify: false}).then(function() {
                    $rootScope.$broadcast('$stateChangeSuccess', to, toParams, from, fromParams);
                });
                return;
            }
        });

        $rootScope.$on(AuthService.events.loggedOut, function () {
            $rootScope.user = null;
        });

        $rootScope.$on(LogoutInterceptor.events.logOutUser, function () {
            AuthService.logout();
        });

        // Restore user session on full page refresh
        if (AuthService.isAuthenticated()) {
            $rootScope.$broadcast(AuthService.events.loggedIn);
        }
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
        'ase.auth',
        'ase.config',
        'ase.notifications',
        'ase.navbar',
        'ase.views.geography',
        'ase.views.login',
        'ase.views.recordtype',
        'ase.views.settings',
        'ase.views.usermgmt',
        'ase.resources',
        'ui.router',
        'LocalStorageModule'
    ])
    .config(DefaultRoutingConfig)
    .config(LocalStorageConfig)
    .config(LogConfig)
    .run(RunConfig);
})();

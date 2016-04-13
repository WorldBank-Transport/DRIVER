(function () {
    'use strict';

    /* ngInject */
    function DefaultRoutingConfig($locationProvider, $urlRouterProvider, WebConfig) {
        $locationProvider.html5Mode(WebConfig.html5Mode.enabled);
        $locationProvider.hashPrefix(WebConfig.html5Mode.prefix);

        $urlRouterProvider.otherwise('/');
    }

    /* ngInject */
    function LogConfig($logProvider, WebConfig) {
        $logProvider.debugEnabled(WebConfig.debug);
    }

    /* ngInject */
    function LeafletDefaultsConfig(LeafletDefaultsProvider, WebConfig) {
        LeafletDefaultsProvider.setDefaults({
            center: WebConfig.localization.centerLatLon,
            zoom: 5,
            crs: L.CRS.EPSG3857,
            touchZoom: false,
            scrollWheelZoom: false
        });
    }

    /* ngInject */
    function LocalStorageConfig(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('DRIVER.web');
    }

    /* ngInject */
    function TranslationConfig($translateProvider, $windowProvider) {
        // Configure the location of the translation json files on the server
        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });

        // Log untranslated tokens to console
        $translateProvider.useMissingTranslationHandlerLog();

        // Enable sanitization of token
        $translateProvider.useSanitizeValueStrategy('sanitizeParameters');

        // Get the browser's navigator object and use for determining preferred language
        var navigator = $windowProvider.$get().navigator;
        var language = (navigator.languages ? navigator.languages[0] :
                        (navigator.language || navigator.userLanguage)).substring(0,2);

        // Interpret Zulu ('zu') to request dev language ('exclaim')
        $translateProvider.preferredLanguage(language === 'zu' ? 'exclaim' : language);
        $translateProvider.fallbackLanguage('en');
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
                $state.go('login', {next: to, nextParams: toParams}, {notify: false}).then(function() {
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
     * @name driver
     * @description
     * # driver: Data for Road Incident Visualization, Evaluation, and Reporting
     *
     * Main module of the application.
     */
    angular.module('driver', [
        'Leaflet',
        'debounce',
        'driver.config',
        'ase.auth',
        'driver.navbar',
        'driver.filterbar',
        'driver.toddow',
        'driver.state',
        'driver.stepwise',
        'driver.views.account',
        'driver.views.login',
        'driver.views.dashboard',
        'driver.views.map',
        'driver.views.record',
        'driver.views.duplicates',
        'ui.router',
        'LocalStorageModule',
        'pascalprecht.translate'
    ])
    .config(DefaultRoutingConfig)
    .config(LogConfig)
    .config(LeafletDefaultsConfig)
    .config(LocalStorageConfig)
    .config(TranslationConfig)
    .run(RunConfig);
})();

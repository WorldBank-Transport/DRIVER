(function () {
'use strict';

    /**
     * @ngInject
     */
    function StateConfig($stateProvider) {

        $stateProvider.state('settings', {
            abstract: true,
            parent: 'sidebar',
            url: '/settings',
            template: '<ui-view></ui-view>'
        });
        $stateProvider.state('settings.list', {
            url: '',
            template: '<ase-settings-list></ase-settings-list>'
        });
    }

    angular
      .module('ase.views.settings', [
        'ui.router',
        'ui.bootstrap',
        'ase.utils',
        'ase.config',
        'ase.directives',
        'ase.notifications',
        'ase.views.sidebar',
        'ase.auth'
      ]).config(StateConfig);

})();

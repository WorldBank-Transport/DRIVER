(function () {
'use strict';

    /**
     * @ngInject
     */
    function StateConfig($stateProvider) {

        $stateProvider.state('usermgmt', {
            abstract: true,
            parent: 'sidebar',
            url: '/user-management',
            template: '<ui-view></ui-view>'
        });
        $stateProvider.state('usermgmt.list', {
            url: '',
            template: '<ase-user-list></ase-user-list>'
        });

        $stateProvider.state('usermgmt.add', {
            url: '/add',
            template: '<ase-user-add></ase-user-add>'
        });
        $stateProvider.state('usermgmt.edit', {
            url: '/edit/:id',
            template: '<ase-user-edit></ase-user-edit>'
        });
        $stateProvider.state('usermgmt.details', {
            url: '/details/:userid',
            template: '<ase-user-details></ase-user-details>'
        });
    }

    angular
      .module('ase.views.usermgmt', [
        'ui.router',
        'ui.bootstrap',
        'ase.notifications',
        'ase.auth',
        'ase.directives',
        'ase.views.sidebar',
        'ase.userdata'
      ]).config(StateConfig);

})();